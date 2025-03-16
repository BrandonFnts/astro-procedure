import { type APIRoute } from 'astro';
import { getUserDatabases } from '../../backend/databaseService';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { searchString } = await request.json();

        const databases = await getUserDatabases({
            searchString: searchString?.toString()
        });

        if (!databases || databases.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'No se encontraron bases de datos',
                    data: []
                }),
                {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Bases de datos obtenidas correctamente',
                data: databases
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {        
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Error al obtener bases de datos',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};