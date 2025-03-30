<template>
    <div class="bg-white rounded-xl shadow-xl p-6 md:p-8">
        <!-- Header: Información y acciones -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <!-- Información de la base de datos -->
            <div class="flex-1 space-y-2">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-800 font-mono flex items-center gap-3">
                    <i class="fas fa-database text-blue-500"></i>
                    {{ dbName }}
                </h1>
                <p class="text-sm text-gray-500">
                    Colecciones disponibles: {{ collections.length }}
                </p>
            </div>

            <!-- Botones de acciones -->
            <div class="flex flex-col sm:flex-row gap-3">
                <!-- Botón de regresar -->
                <a :href="`/Mongo`"
                    class="flex items-center gap-2 bg-gray-600 text-white px-5 py-3 rounded-lg hover:shadow-lg transition-all">
                    <i class="fas fa-arrow-left"></i>
                    <span class="text-sm md:text-base">Regresar</span>
                </a>

                <button @click="handleBackup" :disabled="backupLoading"
                    class="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50">
                    <i v-if="backupLoading" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-download"></i>
                    <span class="text-sm md:text-base">{{ backupLoading ? 'Generando backup...' : 'Backup Completo'
                    }}</span>
                </button>
                <button @click="handleImport"
                    class="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-lg hover:shadow-lg transition-all">
                    <i class="fas fa-upload text-sm"></i>
                    <span class="text-sm md:text-base">Importar Datos</span>
                </button>
            </div>
        </header>

        <!-- Contenedor de colecciones -->
        <section class="border-t border-gray-100 pt-6">
            <!-- Estado de carga y error -->
            <div v-if="loading" class="animate-pulse space-y-4">
                <div v-for="i in 6" :key="i" class="h-16 bg-gray-100 rounded-lg"></div>
            </div>

            <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div class="flex items-center gap-3">
                    <i class="fas fa-exclamation-circle text-red-400"></i>
                    <div>
                        <p class="text-red-700 font-medium">{{ error }}</p>
                        <button @click="fetchCollections"
                            class="mt-2 text-red-700 hover:text-red-900 text-sm flex items-center gap-2">
                            <i class="fas fa-redo"></i>
                            Intentar nuevamente
                        </button>
                    </div>
                </div>
            </div>

            <!-- Grid de colecciones -->
            <div v-else
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto p-2">
                <div v-for="collection in collections" :key="collection.name"
                    class="group relative bg-white rounded-lg border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 ease-out p-4">
                    <div class="flex justify-between items-start">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 mb-2">
                                <i class="fas fa-folder text-blue-400"></i>
                                <h3 class="text-lg font-semibold text-gray-800 truncate">
                                    {{ collection.name }}
                                </h3>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Tipo:
                                    Colección</span>
                            </div>
                        </div>
                        <button @click="exportCollection(collection.name)"
                            class="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                            title="Exportar colección">
                            <i class="fas fa-file-export text-sm"></i>
                        </button>
                    </div>
                    <!-- Efecto hover -->
                    <div
                        class="absolute inset-0 border-2 border-transparent group-hover:border-blue-100 rounded-lg pointer-events-none transition-all duration-300">
                    </div>
                </div>
            </div>

            <!-- Mensaje sin colecciones -->
            <div v-if="!loading && !error && collections.length === 0" class="text-center p-8 bg-gray-50 rounded-lg">
                <i class="fas fa-inbox text-gray-400 text-3xl mb-3"></i>
                <p class="text-gray-500">No se encontraron colecciones</p>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';

const props = defineProps({
    dbName: {
        type: String,
        required: true
    }
});

const collections = ref<Array<any>>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const backupLoading = ref(false);

const fetchCollections = async () => {
    try {
        loading.value = true;
        const response = await fetch('/api/mongo/getCollections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(props.dbName)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const { data } = await response.json();
        collections.value = data;

    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Error al cargar colecciones';
    } finally {
        loading.value = false;
    }
};

const exportCollection = async (collectionName: string) => {
    try {
        const response = await fetch('/api/mongo/exportCollection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dbName: props.dbName, collectionName })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en exportación');
        }

        if (data.empty) {
            await Swal.fire({
                icon: 'info',
                title: 'Colección vacía',
                text: `La colección "${collectionName}" no tiene datos para exportar.`,
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const defaultFilename = `${props.dbName}_${collectionName}_export.json`;

        await saveFile(blob, defaultFilename);

    } catch (err) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err instanceof Error ? err.message : 'Error al exportar',
            confirmButtonText: 'Cerrar'
        });
    }
};

const handleBackup = async () => {
    try {
        backupLoading.value = true;

        const response = await fetch('/api/mongo/mongoBackup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dbName: props.dbName })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        const defaultFilename = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : `${props.dbName}_backup.gz`;

        await saveFile(blob, defaultFilename);
        backupLoading.value = false;
    } catch (error) {
        backupLoading.value = false;
        alert(error instanceof Error ? error.message : 'Error al generar backup');
    }
};

declare global {
    interface Window {
        showSaveFilePicker?: (options?: any) => Promise<FileSystemFileHandle>;
        showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
    }
}

interface FileSystemFileHandle {
    createWritable(): Promise<any>;
    getFile(): Promise<File>;
}

async function saveFile(blob: Blob, defaultFilename: string) {
    if (window.showSaveFilePicker) {
        try {
            const opts = {
                suggestedName: defaultFilename,
                types: [
                    {
                        description: 'Backup GZIP',
                        accept: { 'application/gzip': ['.gz'] }
                    }
                ]
            };
            const handle = await window.showSaveFilePicker(opts);
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (error) {
        }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFilename;
    a.click();
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
}

const handleImport = async () => {
    try {
        let file: File;

        if (window.showOpenFilePicker) {
            const handles: FileSystemFileHandle[] = await window.showOpenFilePicker({
                types: [
                    {
                        description: 'Archivos JSON',
                        accept: { 'application/json': ['.json'] }
                    }
                ]
            });
            const [handle] = handles;
            file = await handle.getFile();
        } else {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';
            input.style.display = 'none';
            document.body.appendChild(input);
            file = await new Promise<File>((resolve, reject) => {
                input.onchange = () => {
                    if (input.files && input.files.length > 0) {
                        resolve(input.files[0]);
                    } else {
                        reject(new Error('No se seleccionó ningún archivo'));
                    }
                };
                input.click();
            });
            document.body.removeChild(input);
        }

        const text = await file.text();
        const jsonContent = JSON.parse(text);

        const { value: collectionName } = await Swal.fire({
            title: 'Nombre de la colección',
            input: 'text',
            inputLabel: 'Ingresa el nombre de la colección a importar',
            inputPlaceholder: 'Nombre de la colección',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar'
        });

        if (!collectionName) {
            return;
        }

        const response = await fetch('/api/mongo/importCollection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dbName: props.dbName,
                collectionName,
                data: jsonContent
            })
        });

        if (!response.ok) {
            throw new Error('Error en la importación');
        }

        await Swal.fire({
            icon: 'success',
            title: 'Importación exitosa',
            text: 'La colección fue importada correctamente.',
            confirmButtonText: 'Entendido'
        });
        fetchCollections();
    } catch (error) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error instanceof Error ? error.message : 'Error al importar',
            confirmButtonText: 'Cerrar'
        });
    }
};

onMounted(() => {
    fetchCollections();
});
</script>