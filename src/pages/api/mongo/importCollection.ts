import type { APIRoute } from "astro";
import { importCollectionFromJson } from "../../../backend/mongoService";

export const POST: APIRoute = async ({ request }) => {
    try {
        const payload = await request.json();
        const { dbName, collectionName, data } = payload;

        if (!dbName || !collectionName || !data) {
            return new Response(
                JSON.stringify({ success: false, message: "Faltan parámetros" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!Array.isArray(data)) {
            return new Response(
                JSON.stringify({ success: false, message: "El formato de los datos es incorrecto. Se esperaba un arreglo." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const result = await importCollectionFromJson(dbName, collectionName, data);

        return new Response(
            JSON.stringify({ success: true, message: "Importación exitosa", result }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                message: error instanceof Error ? error.message : "Error desconocido",
                details: error instanceof Error ? error.stack : null
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};