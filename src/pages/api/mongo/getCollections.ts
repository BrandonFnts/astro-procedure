import { type APIRoute } from "astro";
import { getCollections } from "../../../backend/mongoService";

export const POST: APIRoute = async ({ request }) => {
  try {
    const dbName = await request.json();
    
    if (!dbName || typeof dbName !== "string") {
      return new Response(
        JSON.stringify({ success: false, message: "Nombre de base de datos inválido" }),
        { status: 400 }
      );
    }

    const collections = await getCollections(dbName);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: collections
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};