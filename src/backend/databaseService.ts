// src/services/databaseService.ts
import sql from "mssql";
import "dotenv/config";

const dbConfig: sql.config = {
    user: process.env.DB_USER ?? "AdminUser",
    password: "123456789",
    server: "127.0.0.1",
    database: "AdminTools",
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

export async function getDatabases(): Promise<any[]> {
    let pool: sql.ConnectionPool | null = null;
    try {
        pool = await sql.connect(dbConfig);
        const request = new sql.Request(pool);

        const result = await request.query("EXEC GetDatabases_SP");
        
        return result.recordset;
    } catch (error) {
        console.error("Error al obtener las bases de datos:", error);
        return [];
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

export async function createDatabase(params: {
    dbname: string;
    datafilename: string;
    datasizeMB: number;
    datafilegrowthMB: number | null;
    datafilegrowthPercent: number | null;
    logfilename: string;
    logsizeMB: number;
    logfilegrowthMB: number | null;
    logfilegrowthPercent: number | null;
}): Promise<void> {
    let pool: sql.ConnectionPool | null = null;

    try {
        pool = await sql.connect(dbConfig);
        const request = new sql.Request(pool);

        await request
            .input("dbname", sql.NVarChar, params.dbname)
            .input("datafilename", sql.NVarChar, params.datafilename)
            .input("datasizeMB", sql.Int, params.datasizeMB)
            .input("datafilegrowthMB", sql.Int, params.datafilegrowthMB)
            .input("datafilegrowthPercent", sql.Int, params.datafilegrowthPercent)
            .input("logfilename", sql.NVarChar, params.logfilename)
            .input("logsizeMB", sql.Int, params.logsizeMB)
            .input("logfilegrowthMB", sql.Int, params.logfilegrowthMB)
            .input("logfilegrowthPercent", sql.Int, params.logfilegrowthPercent)
            .query(
                "EXEC CreateCustomDatabase @dbname, @datafilename, @datasizeMB, @datafilegrowthMB, @datafilegrowthPercent, @logfilename, @logsizeMB, @logfilegrowthMB, @logfilegrowthPercent",
            );

        console.log("Base de datos creada exitosamente");
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido:", error);
        }
        throw error;
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

export async function manageDatabaseSecurity(params: {
    loginName: string;
    password: string;
    userName: string;
    databaseName: string;
    tablesPermissions?: string;
    schemasPermissions?: string;
    rolesMembership?: string;
    createRoles?: string;
}): Promise<void> {
    let pool: sql.ConnectionPool | null = null;

    try {
        pool = await sql.connect(dbConfig);
        const request = new sql.Request(pool);

        await request
            .input("LoginName", sql.NVarChar, params.loginName)
            .input("Password", sql.NVarChar, params.password)
            .input("UserName", sql.NVarChar, params.userName)
            .input("DatabaseName", sql.NVarChar, params.databaseName)
            .input("TablesPermissions", sql.NVarChar, params.tablesPermissions || null)
            .input("SchemasPermissions", sql.NVarChar, params.schemasPermissions || null)
            .input("RolesMembership", sql.NVarChar, params.rolesMembership || null)
            .input("CreateRoles", sql.NVarChar, params.createRoles || null)
            .query("EXEC ManageDatabaseSecurity @LoginName, @Password, @UserName, @DatabaseName, @TablesPermissions, @SchemasPermissions, @RolesMembership, @CreateRoles");

        console.log("Seguridad configurada exitosamente");
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido:", error);
        }
        throw error;
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

export async function getLogs(params: {
    startDate?: string | null;
    endDate?: string | null;
    spName?: string | null;
    estado?: string | null;
    usuario?: string | null;
}): Promise<any[]> {
    let pool: sql.ConnectionPool | null = null;

    try {
        pool = await sql.connect(dbConfig);
        const request = new sql.Request(pool);

        const result = await request
            .input("StartDate", sql.NVarChar, params.startDate || null)
            .input("EndDate", sql.NVarChar, params.endDate || null)
            .input("SPName", sql.NVarChar, params.spName || null)
            .input("Estado", sql.NVarChar, params.estado || null)
            .input("Usuario", sql.NVarChar, params.usuario || null)
            .query("EXEC AdminTools.dbo.GetLogSP @StartDate, @EndDate, @SPName, @Estado, @Usuario");

        return result.recordset;

    } catch (error) {
        console.error("Error obteniendo logs:", error);
        throw error;
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}