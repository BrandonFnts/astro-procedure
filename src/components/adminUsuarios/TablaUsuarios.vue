<template>
    <div class="container mx-auto p-4 bg-white rounded-lg shadow-lg">
        <h1 class="text-2xl font-bold text-center mb-4">Logins y usuarios</h1>

        <!-- Controles de Paginación -->
        <div class="mb-4 flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <select v-model="pageSize" class="px-2 py-1 border rounded-md text-sm">
                    <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
                </select>
                <span class="text-sm text-gray-600">
                    Mostrando {{ startItem }}-{{ endItem }} de {{ totalRecords }}
                </span>
            </div>

            <button @click="openModal" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                <i class="fas fa-plus"></i>
                Agregar
            </button>
        </div>

        <!-- Tabla de datos -->
        <table class="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead class="bg-orange-400">
                <tr class="text-left">
                    <th class="px-4 py-2 text-sm font-semibold text-white uppercase">Server Login</th>
                    <th class="px-4 py-2 text-sm font-semibold text-white uppercase">Usuario</th>
                    <th class="px-4 py-2 text-sm font-semibold text-white uppercase">Tipo de Usuario</th>
                    <th class="px-4 py-2 text-sm font-semibold text-white uppercase">Permisos</th>
                    <th class="px-4 py-2 text-sm font-semibold text-white uppercase">Roles</th>
                    <th class="px-4 py-2 text-sm font-semibold text-white uppercase">Eliminar</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="loading" class="text-center">
                    <td colspan="6" class="px-4 py-2 text-gray-600">Cargando...</td>
                </tr>
                <tr v-else-if="paginatedLogins.length === 0" class="text-center">
                    <td colspan="6" class="px-4 py-2 text-gray-600">No se encontraron datos</td>
                </tr>
                <tr v-for="(item, index) in paginatedLogins" :key="index" class="hover:bg-orange-200">
                    <td class="px-4 py-2 text-gray-800">{{ item.ServerLogin }}</td>
                    <td class="px-4 py-2 text-gray-800">{{ item.DatabaseUser }}</td>
                    <td class="px-4 py-2 text-gray-800">{{ item.UserType }}</td>
                    <td class="px-4 py-2 text-gray-800">{{ item.Permissions || 'Sin permisos' }}</td>
                    <td class="px-4 py-2 text-gray-800">{{ item.Roles || 'Sin roles' }}</td>
                    <td class="px-4 py-2 text-gray-800 text-center">
                        <button @click="handleDelete(item.ServerLogin, item.DatabaseUser)"
                            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 space-x-2 flex items-center justify-center gap-2 w-full">
                            <i class="fas fa-trash-alt"></i>
                            <span>Eliminar</span>
                        </button>
                    </td>
                </tr>
            </tbody>

        </table>

        <!-- Navegación de páginas -->
        <div class="mt-4 flex justify-center items-center space-x-2">
            <button @click="prevPage" :disabled="currentPage === 1"
                class="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                Anterior
            </button>

            <span v-for="page in pages" :key="page">
                <button @click="currentPage = page"
                    :class="['px-3 py-1 rounded-md', currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100']">
                    {{ page }}
                </button>
            </span>

            <button @click="nextPage" :disabled="currentPage === totalPages"
                class="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                Siguiente
            </button>
        </div>

        <FormUsuarios v-if="showModal" :isOpen="showModal" @close="closeModal" />
    </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import FormUsuarios from './FormUsuarios.vue';
import Swal from 'sweetalert2';

export default {
    name: 'TablaUsuarios',
    components: {
        FormUsuarios
    },
    setup() {
        const logins = ref([]);
        const loading = ref(true);
        const showModal = ref(false);

        // Variables de paginación
        const currentPage = ref(1);
        const pageSize = ref(10);
        const pageSizes = ref([5, 10, 20, 50]);

        // Computados
        const totalRecords = computed(() => logins.value.length);
        const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value));

        const paginatedLogins = computed(() => {
            const start = (currentPage.value - 1) * pageSize.value;
            const end = start + pageSize.value;
            return logins.value.slice(start, end);
        });

        const pages = computed(() => {
            const maxVisible = 5;
            let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
            let end = Math.min(start + maxVisible - 1, totalPages.value);

            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }

            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        });

        const startItem = computed(() => (currentPage.value - 1) * pageSize.value + 1);
        const endItem = computed(() => Math.min(currentPage.value * pageSize.value, totalRecords.value));

        // Métodos
        const fetchLoginsData = async () => {
            try {
                loading.value = true;
                const response = await fetch('/api/sqlServer/getUsersWithLogins');
                const data = await response.json();
                logins.value = data.users;
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                loading.value = false;
            }
        };

        const prevPage = () => currentPage.value > 1 && currentPage.value--;
        const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;

        // Watchers
        watch(pageSize, () => {
            currentPage.value = 1;
        });

        const handleDelete = async (loginName, userName) => {
            loading.value = true;
            try {
                const payload = { loginName, userName };

                const response = await fetch('/api/sqlServer/deleteUserAndLogin', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: payload })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    await Swal.fire('Eliminado', 'El usuario y login fueron eliminados correctamente', 'success');
                    fetchLoginsData();
                } else {
                    await Swal.fire('Error', result.error || 'Error desconocido', 'error');
                }
            } catch (error) {
                console.error('Error en la petición:', error);
                await Swal.fire('Error', 'Error en la petición al servidor', 'error');
            } finally {
                loading.value = false;
            }
        };

        onMounted(fetchLoginsData);

        const openModal = () => {
            showModal.value = true;
        };

        const closeModal = () => {
            showModal.value = false;
            fetchLoginsData();
        };

        return {
            logins,
            loading,
            showModal,
            openModal,
            closeModal,
            paginatedLogins,
            currentPage,
            pageSize,
            pageSizes,
            totalPages,
            pages,
            startItem,
            endItem,
            totalRecords,
            prevPage,
            nextPage,
            handleDelete
        };
    }
};
</script>