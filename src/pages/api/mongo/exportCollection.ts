import type { APIRoute } from 'astro';
import { exportCollectionAsJson } from '../../../backend/mongoService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    const { dbName, collectionName } = payload;

    if (!dbName || !collectionName) {
      return new Response(JSON.stringify({ success: false, message: 'Faltan parámetros' }), { status: 400 });
    }

    const jsonData = await exportCollectionAsJson(dbName, collectionName);

    return new Response(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${dbName}_${collectionName}_export.json"`
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error instanceof Error ? error.message : 'Error desconocido' }), { status: 500 });
  }
};
