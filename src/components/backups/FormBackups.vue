<template>
    <div class="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Realizar Backup de Base de Datos</h2>

        <!-- Selección de Base de Datos -->
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
                Database Name <span class="text-red-500">*</span>
            </label>
            <div class="relative">
                <input v-model="databaseSearch" type="text" @focus="handleDropdownFocus" @blur="handleDropdownBlur"
                    placeholder="Buscar base de datos..."
                    class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">

                <!-- Loading Spinner -->
                <div v-if="loadingDatabases" class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>

                <!-- Dropdown Options -->
                <div v-show="showDropdown && databaseSearch.length > 0"
                    class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                    <div v-if="filteredDatabases.length === 0" class="px-4 py-2 text-gray-500">
                        {{ loadingDatabases ? 'Buscando bases de datos...' : 'No se encontraron bases de datos' }}
                    </div>

                    <div v-for="db in filteredDatabases" :key="db.DatabaseName" @mousedown.prevent="selectDatabase(db)"
                        class="cursor-pointer hover:bg-blue-50 px-4 py-2 transition-colors duration-200">
                        <div class="font-medium text-gray-900">{{ db.DatabaseName }}</div>
                        <div class="text-xs text-gray-500 mt-1">
                            Creado: {{ formatDate(db.CreationDate) }} |
                            Estado: <span :class="statusColor(db.Status)">{{ db.Status }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Campo oculto para la base seleccionada -->
            <input v-model="formData.databaseName" type="hidden" required>
        </div>

        <!-- Ruta de almacenamiento -->
        <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Ruta de almacenamiento <span
                    class="text-red-500">*</span></label>
            <input v-model="formData.path" type="text" placeholder="Ej: C:\BackupsPersonalizados\" required
                class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>

        <!-- Botón de backup -->
        <button :disabled="submitting" @click="runBackup"
            class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50">
            {{ submitting ? 'Creando Backup...' : 'Crear Backup' }}
        </button>

        <!-- Mensaje de estado -->
        <div v-if="successMessage" class="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {{ errorMessage }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import debounce from 'lodash/debounce';

interface Database {
    DatabaseName: string;
    CreationDate: string;
    CompatibilityLevel: number;
    Status: string;
}

interface FormData {
    databaseName: string;
    path: string;
}

const databaseSearch = ref('');
const showDropdown = ref(false);
const filteredDatabases = ref<Database[]>([]);
const loadingDatabases = ref(false);
const submitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const formData = ref<FormData>({
    databaseName: '',
    path: '',
});

watch(databaseSearch, (newVal) => {
    if (newVal.length === 0 || newVal.length >= 2) {
        searchDatabases(newVal);
    }
});

const selectDatabase = (db: Database) => {
    formData.value.databaseName = db.DatabaseName;
    databaseSearch.value = db.DatabaseName;
    showDropdown.value = false;
};

const searchDatabases = debounce(async (searchTerm: string) => {
    try {
        loadingDatabases.value = true;
        const response = await fetch('/api/getUserDatabases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ searchString: searchTerm })
        });

        const { data } = await response.json();
        filteredDatabases.value = data;
    } catch (error) {
        console.error('Error fetching databases:', error);
        filteredDatabases.value = [];
    } finally {
        loadingDatabases.value = false;
    }
}, 300);

const handleDropdownFocus = () => {
    showDropdown.value = true;
    if (databaseSearch.value.length === 0) {
        searchDatabases('');
    }
};

const handleDropdownBlur = () => {
    setTimeout(() => {
        if (!document.activeElement?.closest('.dropdown-options')) {
            showDropdown.value = false;
        }
    }, 200);
};

const statusColor = (status: string) => {
    return {
        'text-green-600': status === 'ONLINE',
        'text-red-600': status === 'OFFLINE',
        'text-yellow-600': status === 'RESTORING'
    };
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const runBackup = async () => {
    successMessage.value = '';
    errorMessage.value = '';

    if (!formData.value.databaseName || !formData.value.path) {
        errorMessage.value = 'Debes seleccionar la base de datos y especificar la ruta.';
        return;
    }

    if (!formData.value.path.endsWith('\\')) {
        formData.value.path += '\\';
    }

    try {
        submitting.value = true;
        errorMessage.value = '';
        const response = await fetch('/api/createBackup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData.value)
        });

        const result = await response.json();

        if (response.ok) {
            successMessage.value = result.message;
        } else {
            errorMessage.value = result.message;
        }
    } catch (err) {
        errorMessage.value = 'Error en la solicitud: ' + err;
    } finally {
        submitting.value = false;
    }
};
</script>