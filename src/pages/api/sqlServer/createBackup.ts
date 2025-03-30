import { createBackup } from "../../../backend/databaseService";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    if (!data.databaseName || !data.path) {
      return new Response(
        JSON.stringify({
          message: "Faltan campos requeridos: 'databaseName' y 'path' son obligatorios."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const backupResult = await createBackup(data);

    return new Response(
      JSON.stringify({
        message: "Backup realizado exitosamente.",
        data: backupResult,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error al realizar el backup:", error);
    return new Response(
      JSON.stringify({
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al realizar el backup.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
