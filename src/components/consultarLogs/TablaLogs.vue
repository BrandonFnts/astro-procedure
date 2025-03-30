<template>
    <div class="container mx-auto p-4">
        <!-- Filtros -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                    <VueDatePicker v-model="filters.startDate" :format="'yyyy-MM-dd'" auto-apply />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                    <VueDatePicker v-model="filters.endDate" :format="'yyyy-MM-dd'" auto-apply />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">SP Name</label>
                    <input v-model="filters.spName" type="text" class="w-full px-3 py-2 border rounded-md"
                        placeholder="Buscar por nombre" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select v-model="filters.estado" class="w-full px-3 py-2 border rounded-md">
                        <option value="">Todos</option>
                        <option value="Exitoso">Exitoso</option>
                        <option value="Fallido">Fallido</option>
                        <option value="Error Parcial">Error Parcial</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                    <input v-model="filters.usuario" type="text" class="w-full px-3 py-2 border rounded-md"
                        placeholder="Filtrar por usuario" />
                </div>
            </div>

            <button @click="fetchLogs" :disabled="isLoading"
                class="mt-4 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors disabled:bg-gray-400">
                {{ isLoading ? 'Cargando...' : 'Aplicar Filtros' }}
            </button>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">Registros por página:</span>
                <select v-model="pageSize" class="px-2 py-1 border rounded-md text-sm" @change="currentPage = 1">
                    <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
                </select>
            </div>

            <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600">
                    Mostrando {{ paginatedLogs.length ? startIndex + 1 : 0 }} -
                    {{ endIndex }} de {{ totalItems }}
                </span>
                <div class="flex gap-1">
                    <button @click="currentPage--" :disabled="currentPage === 1"
                        class="px-3 py-1 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50">
                        Anterior
                    </button>
                    <button v-for="page in totalPages" :key="page" @click="currentPage = page" :class="{
                        'bg-blue-500 text-white': currentPage === page,
                        'hover:bg-gray-50': currentPage !== page
                    }" class="px-3 py-1 border rounded-md text-sm">
                        {{ page }}
                    </button>
                    <button @click="currentPage++" :disabled="currentPage === totalPages"
                        class="px-3 py-1 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50">
                        Siguiente
                    </button>
                </div>
            </div>
        </div>

        <!-- Tabla -->
        <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {{ error }}
        </div>

        <div class="overflow-x-auto rounded-lg shadow">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SP Name
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuario
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mensaje Error
                        </th>
                    </tr>
                </thead>

                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="log in paginatedLogs" :key="log.ID">
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ formatDate(log.Fecha) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ log.SPName }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ log.Usuario }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="{
                                'bg-green-100 text-green-800': log.Estado === 'Exitoso',
                                'bg-red-100 text-red-800': log.Estado === 'Fallido',
                                'bg-yellow-100 text-yellow-800': log.Estado === 'Error Parcial'
                            }" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                {{ log.Estado }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-pre-wrap max-w-xs">
                            {{ log.MensajeError }}
                        </td>
                    </tr>

                    <tr v-if="!logs.length && !isLoading">
                        <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                            No se encontraron registros
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { format } from 'date-fns'

const logs = ref([])
const isLoading = ref(false)
const error = ref(null)
// Nuevas variables reactivas
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizes = [10, 20, 50, 100]

// Computed properties para paginación
const totalItems = computed(() => logs.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => {
    const end = startIndex.value + pageSize.value
    return end > totalItems.value ? totalItems.value : end
})

const paginatedLogs = computed(() => {
    return logs.value.slice(startIndex.value, endIndex.value)
})

const filters = reactive({
    startDate: null,
    endDate: null,
    spName: '',
    estado: '',
    usuario: ''
})

const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
}

const fetchLogs = async () => {
    try {
        isLoading.value = true
        error.value = null

        const params = {
            startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : null,
            endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : null,
            spName: filters.spName,
            estado: filters.estado,
            usuario: filters.usuario
        }

        const response = await axios.post('/api/sqlServer/getLogs', params)
        logs.value = response.data
        currentPage.value = 1
    } catch (err) {
        error.value = err.response?.data?.message || 'Error al cargar los logs'
    } finally {
        isLoading.value = false
    }
}

// Cargar datos iniciales
fetchLogs()
</script>

<style scoped>
table {
    font-size: 0.875rem;
    /* text-sm */
}

th,
td {
    padding: 0.75rem 1.5rem;
    /* px-6 py-3 */
}
</style>