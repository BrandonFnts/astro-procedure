import type { APIRoute } from "astro";
import { restoreBackup } from "../../../backend/mongoService";
import fs from "node:fs";

export const POST: APIRoute = async ({ request }) => {
    try {
      const formData = await request.formData();
      const dbName = formData.get("dbName")?.toString();
      const file = formData.get("backupFile") as File;
  
      if (!dbName || !file) {
        return new Response(
          JSON.stringify({ success: false, message: "Parámetros faltantes" }),
          { status: 400 }
        );
      }
  
      const tempDir = "./backups";
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const tempPath = `${tempDir}/${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      fs.writeFileSync(tempPath, Buffer.from(arrayBuffer));
  
      await restoreBackup(dbName, tempPath);
  
      return new Response(
        JSON.stringify({ success: true, message: "Restauración completada" }),
        { status: 200 }
      );
  
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: error instanceof Error ? error.message : "Error desconocido",
        }),
        { status: 500 }
      );
    }
  };