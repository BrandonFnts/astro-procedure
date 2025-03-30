<template>
    <div class="container mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">Bases de Datos en Mongo</h1>
            <div class="flex gap-3">
                <button @click="openUserModal"
                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-75"
                    :disabled="loading || restoring">
                    <i class="fas fa-user-plus"></i>
                    <span>Crear Usuario</span>
                </button>
                <button @click="handleRestore"
                    class="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-75"
                    :disabled="loading || restoring">
                    <i class="fas fa-upload mr-2"></i>
                    {{ restoring ? 'Restaurando...' : 'Restaurar Backup' }}
                </button>
                <button @click="openModal"
                    class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2 disabled:opacity-75"
                    :disabled="loading || restoring">
                    <i class="fas fa-plus"></i>
                    <span>Agregar DB</span>
                </button>
            </div>
        </div>

        <!-- Mensaje de carga -->
        <div v-if="loading" class="text-center p-8">
            <div class="animate-pulse space-y-4">
                <div v-for="i in pageSize" :key="i" class="h-12 bg-gray-200 rounded"></div>
            </div>
        </div>

        <!-- Tabla de bases de datos -->
        <div v-else>
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-orange-500">
                    <tr>
                        <th v-for="(header, index) in headers" :key="index"
                            class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            {{ header }}
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="db in paginatedDatabases" :key="db.name" class="hover:bg-orange-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {{ db.name }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ (db.sizeOnDisk / 1024).toFixed(2) }} KB
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span :class="db.empty ? 'text-red-600' : 'text-green-600'">
                                {{ db.empty ? 'Vacía' : 'Con datos' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <button @click="handleDelete(db.name)"
                                class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
                                :disabled="restoring">
                                <i class="fas fa-trash-alt"></i>
                                <span>Eliminar</span>
                            </button>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <a :href="`/AdministracionMongo/${db.name}`"
                                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2">
                                <i class="fas fa-cogs"></i>
                                <span>Administrar</span>
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Paginación -->
            <div class="flex justify-between items-center mt-4">
                <button @click="prevPage" :disabled="currentPage === 1 || restoring"
                    class="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50">
                    Anterior
                </button>
                <span class="text-sm text-gray-700">
                    Página {{ currentPage }} de {{ totalPages }}
                </span>
                <button @click="nextPage" :disabled="currentPage === totalPages || restoring"
                    class="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50">
                    Siguiente
                </button>
            </div>
        </div>

        <!-- Modales -->
        <CrearMongoForm v-if="showModal" :is-open="showModal" @close="handleModalClose" />
        <CrearUsuariosMongo v-if="showUserModal" :is-open="showUserModal" @close="handleUserModalClose" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CrearMongoForm from './CrearMongo.vue';
import CrearUsuariosMongo from './CrearUsuariosMongo.vue';
import Swal from 'sweetalert2';

interface DatabaseInfo {
    name: string;
    sizeOnDisk: number;
    empty: boolean;
}

export default defineComponent({
    name: 'DatabaseList',
    components: {
        CrearMongoForm,
        CrearUsuariosMongo
    },
    data() {
        return {
            databases: [] as DatabaseInfo[],
            loading: false,
            restoring: false,
            showModal: false,
            showUserModal: false,
            currentPage: 1,
            pageSize: 6,
            headers: [
                'Nombre',
                'Tamaño (KB)',
                'Estado',
                'Eliminar',
                'Administrar'
            ]
        };
    },
    computed: {
        totalPages(): number {
            return Math.ceil(this.databases.length / this.pageSize);
        },
        paginatedDatabases(): DatabaseInfo[] {
            const start = (this.currentPage - 1) * this.pageSize;
            return this.databases.slice(start, start + this.pageSize);
        },
    },
    methods: {
        async fetchDatabases() {
            this.loading = true;
            try {
                const response = await fetch('/api/mongo/listDatabases');
                const result = await response.json();

                if (response.ok) {
                    this.databases = result.databases.map((db: any) => ({
                        ...db,
                        sizeOnDisk: db.sizeOnDisk || 0
                    }));
                } else {
                    throw new Error('Error al obtener bases de datos');
                }
            } catch (error) {
                this.showError(error, 'Error al cargar bases de datos');
            } finally {
                this.loading = false;
            }
        },
        async handleRestore() {
            this.restoring = true;
            try {
                const file = await this.selectBackupFile();
                const extractedDbName = this.extractDbNameFromFile(file.name);

                const dbName = await this.promptDatabaseName(extractedDbName);

                if (!dbName) return;

                await this.uploadBackup(dbName, file);
                await this.showSuccess('Backup restaurado exitosamente');
                this.fetchDatabases();

            } catch (error) {
                this.showError(error, 'Error en la restauración');
            } finally {
                this.restoring = false;
            }
        },
        extractDbNameFromFile(filename: string): string | null {
            const baseName = filename.replace(/\.[^/.]+$/, "");
            const match = baseName.match(/^([a-zA-Z0-9_-]+)_/);
            return match ? match[1] : null;
        },

        async promptDatabaseName(defaultName?: string | null): Promise<string | null> {
            const { value: dbName } = await Swal.fire({
                title: 'Confirmar nombre de la base de datos',
                input: 'text',
                inputValue: defaultName || '',
                inputLabel: 'Nombre de la base de datos:',
                inputValidator: (value) => {
                    if (!value) return 'Debe ingresar un nombre';
                    if (!/^[a-zA-Z0-9_-]{1,63}$/.test(value)) {
                        return 'Nombre inválido (solo letras, números, guiones y underscores)';
                    }
                    return null;
                },
                showCancelButton: true,
                confirmButtonText: 'Restaurar',
                cancelButtonText: 'Cancelar',
                inputAttributes: {
                    autocapitalize: 'off',
                    autocorrect: 'off'
                }
            });
            return dbName;
        },
        async selectBackupFile(): Promise<File> {
            if (window.showOpenFilePicker) {
                const handles = await window.showOpenFilePicker({
                    types: [{
                        description: 'Backups MongoDB',
                        accept: { 'application/gzip': ['.gzip', '.gz'] }
                    }]
                });
                const [handle] = handles;
                return handle.getFile();
            } else {
                return new Promise((resolve, reject) => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.gzip,.gz';
                    input.onchange = () => {
                        if (input.files?.[0]) {
                            resolve(input.files[0]);
                        } else {
                            reject(new Error('No se seleccionó archivo'));
                        }
                    };
                    input.click();
                });
            }
        },
        async uploadBackup(dbName: string, file: File) {
            const formData = new FormData();
            formData.append('dbName', dbName);
            formData.append('backupFile', file);

            const response = await fetch('/api/mongo/restoreBackup', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error en el servidor');
            }
        },
        showError(error: unknown, defaultMessage: string) {
            const message = error instanceof Error ? error.message : defaultMessage;
            return Swal.fire('Error', message, 'error');
        },
        showSuccess(message: string) {
            return Swal.fire('Éxito', message, 'success');
        },
        openModal() {
            this.showModal = true;
        },
        handleModalClose() {
            this.showModal = false;
            this.fetchDatabases();
        },
        openUserModal() {
            this.showUserModal = true;
        },
        handleUserModalClose() {
            this.showUserModal = false;
        },
        prevPage() {
            if (this.currentPage > 1) this.currentPage--;
        },
        nextPage() {
            if (this.currentPage < this.totalPages) this.currentPage++;
        },
        async handleDelete(databaseName: string) {
            const confirmation = await Swal.fire({
                title: '¿Eliminar base de datos?',
                text: `Esta acción eliminará permanentemente "${databaseName}"`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
            });

            if (!confirmation.isConfirmed) return;

            this.loading = true;
            try {
                const response = await fetch('/api/mongo/deleteMongoDb', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ databaseName })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message);
                }

                await this.showSuccess('Base de datos eliminada');
                this.fetchDatabases();
            } catch (error) {
                this.showError(error, 'Error al eliminar');
            } finally {
                this.loading = false;
            }
        }
    },
    mounted() {
        this.fetchDatabases();
    },
});
</script>