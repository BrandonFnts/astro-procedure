// src/pages/api/logs.ts
import { type APIRoute } from "astro";
import { getLogs } from "../../../backend/databaseService";

// Función de validación de fecha ISO 8601
const isValidISODate = (dateString: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/.test(dateString);
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validación de formatos de fecha
    if (data.startDate && !isValidISODate(data.startDate)) {
      return new Response(
        JSON.stringify({ message: 'Formato de fecha inicial inválido. Use ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:MM:SS)' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (data.endDate && !isValidISODate(data.endDate)) {
      return new Response(
        JSON.stringify({ message: 'Formato de fecha final inválido. Use ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:MM:SS)' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener logs
    const logs = await getLogs({
      startDate: data.startDate,
      endDate: data.endDate,
      spName: data.spName,
      estado: data.estado,
      usuario: data.usuario
    });

    return new Response(
      JSON.stringify(logs),
      { 
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, max-age=0" 
        }
      }
    );

  } catch (error) {
    console.error("Error obteniendo logs:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Error interno al obtener logs"
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
};