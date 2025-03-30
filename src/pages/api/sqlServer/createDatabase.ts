// src/pages/api/createDatabase.ts
import { createDatabase } from "../../../backend/databaseService";
import { type APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validación de campos obligatorios
    if (
      !data.dbname ||
      !data.datafilename ||
      !data.logfilename ||
      data.datasizeMB <= 0 ||
      data.logsizeMB <= 0
    ) {
      return new Response(
        JSON.stringify({ message: "Faltan campos requeridos o los tamaños iniciales no son válidos." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validación de crecimiento (al menos uno debe estar presente para datos y log)
    if (
      (data.datafilegrowthMB === null && data.datafilegrowthPercent === null) ||
      (data.logfilegrowthMB === null && data.logfilegrowthPercent === null)
    ) {
      return new Response(
        JSON.stringify({ message: "Debe especificar el crecimiento del archivo de datos y log en MB o porcentaje." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Llamar al procedimiento
    await createDatabase(data);

    return new Response(
      JSON.stringify({ message: "Base de datos creada exitosamente." }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error al procesar el formulario:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Ocurrió un error al crear la base de datos.",
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