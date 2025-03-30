import { type APIRoute } from "astro";
import { createDatabase } from "../../../backend/mongoService";

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    const { databaseName,  collections } = payload;

    if (!databaseName) {
      return new Response(
        JSON.stringify({ message: "El nombre de la base de datos es obligatorio." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const message = await createDatabase({ databaseName, collections });

    return new Response(
      JSON.stringify({ message }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en la API de creación de base de datos:", error);
    return new Response(
      JSON.stringify({
        message: "Error al crear la base de datos",
        details: error instanceof Error ? error.message : error
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
