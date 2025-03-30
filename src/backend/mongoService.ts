import mongoose from "mongoose";
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración centralizada de conexión
const connectionOptions: mongoose.ConnectOptions = {
  authSource: 'admin',
  auth: {
    username: "admin",
    password: "123456789"
  },
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
  minPoolSize: 2,
  connectTimeoutMS: 30000
};

const MONGODB_URI = 'mongodb://localhost:28018';

let connection: typeof mongoose | null = null;

async function getConnection(): Promise<typeof mongoose> {
  if (!connection || connection.connection.readyState !== 1) {
    connection = await mongoose.connect(MONGODB_URI, connectionOptions);
    console.log('Nueva conexión establecida');
  }
  return connection;
}

export async function connectDB(): Promise<typeof mongoose> {
  try {
    return await getConnection();
  } catch (error) {
    console.error('Error de conexión:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function listDatabases(): Promise<{ name: string; sizeOnDisk?: number; empty?: boolean }[]> {
  const conn = await connectDB();
  
  try {
    if (!conn.connection.db) {
      throw new Error("La conexión a MongoDB no tiene instancia de base de datos");
    }

    const adminDb = conn.connection.db.admin();
    
    const result = await adminDb.listDatabases();

    const userDatabases = result.databases.filter(db => !['admin', 'config', 'local'].includes(db.name));
    
    return userDatabases.map(db => ({
      name: db.name,
      sizeOnDisk: db.sizeOnDisk,
      empty: db.empty
    }));
    
  } catch (error) {
    console.error("Error al listar bases de datos:", error);
    throw new Error(`Error obteniendo bases de datos: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function closeDB(): Promise<void> {
  if (connection) {
    await connection.disconnect();
    connection = null;
    console.log("Conexión cerrada con MongoDB");
  }
}

export async function createDatabase(payload: {
  databaseName: string;
  collections?: string;
}): Promise<string> {
  const conn = await connectDB();
  try {
    const newDb = conn.connection.useDb(payload.databaseName, { useCache: true });
    
    if (payload.collections?.trim()) {
      const collections = payload.collections.split(',').map(c => c.trim());
      await Promise.all(collections.map(c => newDb.createCollection(c)));
    } else {
      await newDb.createCollection("default_collection");
    }
    
    return `Base de datos ${payload.databaseName} creada exitosamente`;
  } catch (error) {
    console.error("Error al crear la base de datos:", error);
    throw new Error('Failed to create database');
  }
}

export async function deleteDatabase(databaseName: string): Promise<{ success: boolean; message: string }> {
  const conn = await connectDB();
  try {
    const db = conn.connection.useDb(databaseName);
    await db.dropDatabase();
    return { success: true, message: "Base de datos eliminada exitosamente" };
  } catch (error) {
    console.error("Error al eliminar la base de datos:", error);
    throw new Error('Failed to delete database');
  }
}

export async function createUser(payload: {
  username: string;
  password: string;
  roles: Array<{ role: string; db: string }>
}) {
  const conn = await connectDB();
  try {
    if (!conn.connection.db) {
      throw new Error("La conexión a MongoDB no tiene instancia de base de datos");
    }
    
    const adminDb = conn.connection.db.admin();
    const validRoles = payload.roles.length > 0 ? payload.roles : [{ role: "read", db: "admin" }];

    const result = await adminDb.command({
      createUser: payload.username,
      pwd: payload.password,
      roles: validRoles,
      mechanisms: ["SCRAM-SHA-256"],
      digestPassword: true
    });

    console.log(`Usuario ${payload.username} creado con roles:`, validRoles);
    return { 
      success: true, 
      message: "Usuario creado exitosamente",
      data: result 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en createUser:", errorMessage);
    throw new Error(`Fallo al crear usuario: ${errorMessage}`);
  }
}

export interface CollectionInfo {
  name: string;
  type: 'collection' | 'view';
}

export async function getCollections(dbName: string): Promise<CollectionInfo[]> {
  const conn = await connectDB();
  try {
    if (!conn.connection.db) {
      throw new Error("Conexión a MongoDB no establecida");
    }

    const db = conn.connection.useDb(dbName);

    const collections = await db.listCollections();
    
    return collections.map(collection => ({
      name: collection.name,
      type: (collection.type || 'collection') as 'collection' | 'view',
    }));
    
  } catch (error) {
    console.error("Error obteniendo colecciones:", error);
    throw new Error('Error al listar colecciones');
  }
}

const execAsync = promisify(exec);

export async function createBackup(dbName: string): Promise<{ buffer: Buffer; backupId: string }> {
  console.log(dbName);

  if (!/^[a-zA-Z0-9_-]{1,63}$/.test(dbName)) {
    throw new Error('Nombre de base de datos inválido');
  }

  const backupId = uuidv4();
  const outputFile = path.join(os.tmpdir(), `${dbName}_${backupId}.gz`);

  try {
    await execAsync(
      `mongodump --uri="mongodb://admin:123456789@localhost:28018" --db=${dbName} --archive=${outputFile} --gzip --authenticationDatabase=admin`,
      { timeout: 600000 }
    );

    if (!fs.existsSync(outputFile)) {
      throw new Error('Falló la creación del backup');
    }

    const buffer = fs.readFileSync(outputFile);
    fs.rmSync(outputFile, { force: true });
    return { buffer, backupId };

  } catch (error) {
    if (fs.existsSync(outputFile)) {
      fs.rmSync(outputFile, { force: true });
    }
    throw new Error(`Backup fallido: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

export async function restoreBackup(dbName: string, backupPath: string): Promise<void> {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Archivo de backup no encontrado: ${backupPath}`);
    }

    const containerBackupPath = `/tmp/restore_${Date.now()}${path.extname(backupPath)}`;

    await execAsync(`docker cp "${backupPath}" Amogus:${containerBackupPath}`, {
      shell: 'cmd.exe'
    });

    const restoreCommand = [
      'docker exec Amogus mongorestore',
      '--uri="mongodb://admin:123456789@localhost:27017"',
      `--db=${dbName}`,
      `--archive=${containerBackupPath}`,
      '--gzip',
      '--drop',
      '--authenticationDatabase=admin',
      '--verbose'
    ].join(' ');

    const { stdout, stderr } = await execAsync(restoreCommand, {
      shell: 'cmd.exe',
      cwd: process.cwd()
    });

    await execAsync(`docker exec Amogus rm ${containerBackupPath}`, {
      shell: 'cmd.exe'
    });

    if (stderr && /error/i.test(stderr)) {
      throw new Error(stderr);
    }

    console.log('Restauración exitosa:', stdout);
    
  } catch (error) {
    console.error('Detalles del error:', {
      dbName,
      backupPath,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
    
    throw new Error(`Fallo en restauración: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

export async function exportCollectionAsJson(dbName: string, collectionName: string): Promise<string> {
  try {
    const db = mongoose.connection.useDb(dbName);
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();

    if (!documents.length) {
      return JSON.stringify({ empty: true });
    }

    return JSON.stringify(documents, null, 2);
  } catch (error) {
    throw new Error(`Error al exportar colección: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

export async function importCollectionFromJson(
  dbName: string,
  collectionName: string,
  data: any
): Promise<{ insertedCount: number; result: any }> {
  try {
    const db = mongoose.connection.useDb(dbName);
    const collection = db.collection(collectionName);
    const documents = Array.isArray(data) ? data : [data];

    const result = await collection.insertMany(documents);
    console.log(result);
    return { insertedCount: result.insertedCount, result };
  } catch (error) {
    throw new Error(
      `Error al importar colección: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
}