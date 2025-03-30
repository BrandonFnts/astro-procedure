// src/pages/api/mongo/createMongoUser.ts
import { type APIRoute } from "astro";
import { createUser } from "../../../backend/mongoService";

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    const { username, password, roles } = payload;

    // Validación básica
    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "Credenciales requeridas" }),
        { status: 400 }
      );
    }

    // Limpiar roles inválidos
    const cleanedRoles = (roles || [])
      .filter((r: any) => r.role && r.db)
      .map((r: any) => ({
        role: r.role,
        db: r.db
      }));

    // Crear usuario
    const result = await createUser({
      username,
      password,
      roles: cleanedRoles
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Usuario creado exitosamente",
        data: result
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en la API de crear usuario:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        error: error instanceof Error ? error.stack : null
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};