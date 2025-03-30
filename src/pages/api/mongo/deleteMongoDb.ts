import { type APIRoute } from "astro";
import { deleteDatabase } from "../../../backend/mongoService";

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { databaseName } = await request.json();
    if (!databaseName) {
      return new Response(
        JSON.stringify({ success: false, message: "El nombre de la base de datos es obligatorio." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await deleteDatabase(databaseName);
    return new Response(
      JSON.stringify({ success: result.success, message: result.message }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en el endpoint de eliminación de base de datos:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
