import { type APIRoute } from 'astro';
import { deleteUserAndLogin } from '../../backend/databaseService';

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { data } = await request.json();

    await deleteUserAndLogin({
      loginName: data.loginName,
      userName: data.userName
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Usuario y login eliminados correctamente'
    }), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error al eliminar el usuario y login'
    }), { status: 500 });
  }
};
