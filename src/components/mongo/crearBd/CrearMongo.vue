<template>
  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="max-w-6xl w-full bg-white rounded-lg shadow-md overflow-auto">
      <!-- Encabezado del Modal -->
      <div class="flex justify-between items-center p-4 border-b">
        <h2 class="text-2xl font-bold text-gray-800">Crear Base de Datos en Mongo</h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-3xl leading-none">&times;</button>
      </div>
      <div class="p-6">
        <!-- Mensajes de estado -->
        <div v-if="successMessage" class="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {{ errorMessage }}
        </div>

        <!-- Formulario para crear la base de datos -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Accordion: Información de Base de Datos -->
          <div>
            <button @click="toggleSection('info')" type="button"
              class="w-full flex justify-between items-center bg-gray-100 p-3 rounded-md focus:outline-none">
              <span class="font-semibold text-gray-800">Información de Base de Datos</span>
              <svg :class="{ 'transform rotate-180': isSectionOpen.info }"
                class="w-5 h-5 text-gray-600 transition-transform" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-show="isSectionOpen.info" class="mt-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Base de Datos <span class="text-red-500">*</span>
                </label>
                <input v-model="formData.databaseName" type="text" required
                  class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Colecciones (opcional, separadas por comas)
                </label>
                <input v-model="formData.collections" type="text" placeholder="Ej: users, orders, products"
                  class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>

          <!-- Botón de envío -->
          <div class="mt-6 flex justify-end space-x-4">
            <button type="submit" :disabled="isSubmitting"
              class="bg-orange-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-300 flex items-center justify-center">
              <span v-if="isSubmitting" class="flex items-center">
                <svg class="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.145 5.88 3 7.688l3-2.397z">
                  </path>
                </svg>
                Creando...
              </span>
              <span v-else>Crear Base de Datos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface FormData {
  databaseName: string;
  collections: string;
}

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();

const formData = ref<FormData>({
  databaseName: '',
  collections: ''
});

const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const isSectionOpen = ref({
  info: true
});

const toggleSection = (section: keyof typeof isSectionOpen.value) => {
  isSectionOpen.value[section] = !isSectionOpen.value[section];
};

const closeModal = () => {
  emit('close');
  successMessage.value = "";
  resetFormFields();
};

const resetFormFields = () => {
  formData.value = {
    databaseName: '',
    collections: ''
  };
  errorMessage.value = '';
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  successMessage.value = '';
  errorMessage.value = '';
  isSubmitting.value = true;

  if (!formData.value.databaseName.trim()) {
    errorMessage.value = 'El nombre de la base de datos es obligatorio.';
    isSubmitting.value = false;
    return;
  }

  try {
    const payload = { ...formData.value };
    if (payload.collections) {
      payload.collections = payload.collections.split(',').map(col => col.trim()).join(',');
    }

    const response = await fetch('/api/mongo/createMongoDb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear la base de datos');
    }

    successMessage.value = '¡Base de datos creada exitosamente!';
    resetFormFields();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    isSubmitting.value = false;
  }
};

watch([successMessage, errorMessage], () => {
  if (successMessage.value || errorMessage.value) {
    setTimeout(() => {
      successMessage.value = '';
      errorMessage.value = '';
    }, 5000);
  }
});
</script>