import { type APIRoute } from "astro";
import { getDatabases } from "../../backend/databaseService";

export const GET: APIRoute = async () => {
    try {
        const databases = await getDatabases();

        return new Response(
            JSON.stringify({ message: "Bases de datos obtenidas", databases }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error en la API de bases de datos:", error);

        return new Response(
            JSON.stringify({ message: "Error al obtener las bases de datos" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};