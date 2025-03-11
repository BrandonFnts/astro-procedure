import { type APIRoute } from "astro";
import { manageDatabaseSecurity } from '../../backend/databaseService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validación básica
    const requiredFields = ['loginName', 'password', 'userName', 'databaseName'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          message: `Faltan campos requeridos: ${missingFields.join(', ')}` 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validación de formato para permisos
    if (data.tablesPermissions && !isValidPermissionFormat(data.tablesPermissions)) {
      return new Response(
        JSON.stringify({ 
          message: 'Formato de permisos de tablas inválido. Usar: [esquema].[tabla]:permiso1,permiso2;...' 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await manageDatabaseSecurity({
      loginName: data.loginName,
      password: data.password,
      userName: data.userName,
      databaseName: data.databaseName,
      tablesPermissions: data.tablesPermissions,
      schemasPermissions: data.schemasPermissions,
      rolesMembership: data.rolesMembership,
      createRoles: data.createRoles
    });

    return new Response(
      JSON.stringify({ message: "Seguridad configurada exitosamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al configurar seguridad:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Error en configuración de seguridad"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Función auxiliar para validar formato de permisos
function isValidPermissionFormat(input: string): boolean {
  const pattern = /^([\w]+\.)?[\w]+:(SELECT|INSERT|UPDATE|DELETE|EXECUTE|REFERENCES)(,(SELECT|INSERT|UPDATE|DELETE|EXECUTE|REFERENCES))*$/;
  return input.split(';').every(part => pattern.test(part.trim()));
}