import { type APIRoute } from "astro";
import { createBackup } from "../../../backend/mongoService";

export const POST: APIRoute = async ({ request }) => {
    try {
        const payload = await request.json();
        const { dbName } = payload;
      
      if (!dbName || typeof dbName !== "string") {
        return new Response(
          JSON.stringify({ success: false, message: "Nombre de base de datos inválido" }),
          { status: 400 }
        );
      }
      
      const { buffer, backupId } = await createBackup(dbName);
      
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/gzip',
          'Content-Disposition': `attachment; filename="${dbName}_${backupId}.gz"`
        }
      });
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      return new Response(
        JSON.stringify({ success: false, message: errorMessage }),
        { status: 500 }
      );
    }
  };