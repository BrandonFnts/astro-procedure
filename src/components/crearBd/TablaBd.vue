<template>
    <div class="container mx-auto p-4">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">Bases de Datos</h1>
            <button @click="openModal"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2">
                <i class="fas fa-plus"></i>
                <span>Agregar</span>
            </button>
        </div>

        <!-- Mensaje de carga o tabla de bases de datos -->
        <div v-if="loading" class="text-center">
            Cargando bases de datos...
        </div>
        <div v-else>
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-orange-400">
                    <tr>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Nombre
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Tamaño (KB)
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Observaciones
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(db, index) in paginatedDatabases" :key="index" class="hover:bg-orange-200">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {{ db.DATABASE_NAME }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ db.DATABASE_SIZE }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ db.REMARKS || 'N/A' }}
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Controles de paginado -->
            <div class="flex justify-between items-center mt-4">
                <button @click="prevPage" :disabled="currentPage === 1"
                    class="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50">
                    Anterior
                </button>
                <span class="text-sm text-gray-700">
                    Página {{ currentPage }} de {{ totalPages }}
                </span>
                <button @click="nextPage" :disabled="currentPage === totalPages"
                    class="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50">
                    Siguiente
                </button>
            </div>
        </div>

        <!-- Modal para crear nueva base de datos -->
        <DatabaseModal v-if="showModal" :isOpen="showModal" @close="handleModalClose" />
    </div>
</template>

<script>
import DatabaseModal from './Database.vue';

export default {
    name: 'DatabaseList',
    components: { DatabaseModal },
    data() {
        return {
            databases: [],
            loading: false,
            showModal: false,
            currentPage: 1,
            pageSize: 6,
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.databases.length / this.pageSize);
        },
        paginatedDatabases() {
            const start = (this.currentPage - 1) * this.pageSize;
            return this.databases.slice(start, start + this.pageSize);
        },
    },
    methods: {
        async fetchDatabases() {
            this.loading = true;
            try {
                const response = await fetch('/api/getDatabases');
                const result = await response.json();
                if (response.ok) {
                    console.log(result);
                    this.databases = result.databases;
                } else {
                    console.error('Error al obtener las bases de datos:', result.message);
                }
            } catch (error) {
                console.error('Error al conectarse al servidor:', error);
            } finally {
                this.loading = false;
            }
        },
        openModal() {
            this.showModal = true;
        },
        handleModalClose() {
            this.showModal = false;
            this.fetchDatabases();
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
    },
    mounted() {
        this.fetchDatabases();
    },
};
</script>