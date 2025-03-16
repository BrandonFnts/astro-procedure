import { type APIRoute } from "astro";
import { getUsersWithLogins } from "../../backend/databaseService";

export const GET: APIRoute = async () => {
    try {
        const users = await getUsersWithLogins();

        return new Response(
            JSON.stringify({ message: "Usuarios obtenidos", users }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error en la API de usuarios:", error);

        return new Response(
            JSON.stringify({ message: "Error al obtener los usuarios" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};