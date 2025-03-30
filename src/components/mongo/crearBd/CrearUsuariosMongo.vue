<template>

  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="max-w-6xl w-full bg-white rounded-lg shadow-md overflow-auto">
      <div class="flex justify-between items-center p-4 border-b">
        <h2 class="text-2xl font-bold text-gray-800">Crear Usuario con Roles</h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-3xl leading-none">&times;</button>
      </div>
      <div class="p-6">
        <div v-if="successMessage" class="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{{ successMessage }}</div>
        <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{{ errorMessage }}</div>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Datos básicos -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario *</label>
            <input v-model="formData.username" type="text" required class="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
            <div class="relative">
              <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" required
                class="w-full px-3 py-2 border rounded-md pr-10" />
              <button type="button" @click="togglePassword" class="absolute inset-y-0 right-0 px-3">
                {{ showPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </div>

          <!-- Sección de Roles por Base de Datos -->
          <div>
            <button type="button" @click="toggleAccordion('dbRoles')"
              class="w-full text-left p-3 border-t border-b bg-gray-100 hover:bg-gray-200">
              <h3 class="text-lg font-semibold text-gray-800">
                Roles por Base de Datos (Opcional)
                <span class="float-right">{{ accordionState.dbRoles ? '▼' : '▶' }}</span>
              </h3>
            </button>

            <div v-show="accordionState.dbRoles" class="p-4 bg-gray-50">
              <div v-for="(role, index) in formData.rolesByDb" :key="index" class="mb-6 border-b pb-4 last:border-b-0">
                <div class="flex gap-4 items-end">
                  <!-- Selector de Base de Datos -->
                  <div class="flex-1">
                    <select v-model="role.db"
                      class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
                      <option value="" selected>Ninguna selección</option>
                      <option v-for="db in availableDatabases" :key="db" :value="db">{{ db }}</option>
                    </select>
                  </div>

                  <!-- Selector de Rol (Se habilita solo si hay DB seleccionada) -->
                  <div class="flex-1" v-if="role.db">
                    <select v-model="role.role"
                      class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
                      <option value="" selected>Seleccione rol</option>
                      <option v-for="roleOption in commonDbRoles" :key="roleOption" :value="roleOption">
                        {{ roleOption }}
                      </option>
                    </select>
                  </div>

                  <!-- Botones de Acción -->
                  <div class="flex gap-2 mb-2">
                    <button type="button" @click="removeRoleByDb(index)"
                      class="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                      Eliminar
                    </button>
                    <button type="button" @click="addRoleByDb"
                      class="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      v-if="index === formData.rolesByDb.length - 1">
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Acordeón para Roles Generales -->
          <div>
            <button type="button" @click="toggleAccordion('generalRoles')"
              class="w-full text-left p-3 border-t border-b bg-gray-100 hover:bg-gray-200">
              <h3 class="text-lg font-semibold text-gray-800">Asignación de Roles Generales</h3>
            </button>
            <div v-if="accordionState.generalRoles" class="p-4">
              <div class="flex flex-wrap gap-2 mb-4">
                <div v-for="(role, index) in formData.rolesMembership" :key="index"
                  class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                  {{ role }}
                  <button type="button" @click="removeRole(index)"
                    class="ml-2 text-blue-600 hover:text-blue-800">×</button>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 mb-4">
                <label v-for="role in commonRoles" :key="role"
                  class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  :class="{ 'bg-blue-50 border-blue-300': formData.rolesMembership.includes(role) }">
                  <input type="checkbox" v-model="formData.rolesMembership" :value="role"
                    class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
                  <span class="ml-3 text-sm text-gray-700">{{ role }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Botón de envío -->
          <div class="mt-6 flex justify-end space-x-4">
            <button type="submit" :disabled="isSubmitting"
              class="bg-orange-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-orange-700 transition-colors disabled:bg-gray-300">
              <span v-if="isSubmitting">Creando...</span>
              <span v-else>Crear Usuario</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface FormData {
  username: string;
  password: string;
  rolesMembership: string[];
  rolesByDb: { role?: string; db?: string }[];
}

interface AccordionState {
  dbRoles: boolean;
  generalRoles: boolean;
}

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const formData = ref<FormData>({
  username: '',
  password: '',
  rolesMembership: [],
  rolesByDb: [{}]
});

const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const showPassword = ref(false);

const commonRoles = ref([
  'clusterAdmin',
  'userAdminAnyDatabase',
  'readWriteAnyDatabase',
  'dbAdminAnyDatabase',
  'root'
]);

const commonDbRoles = ref([
  'read',
  'readWrite',
  'dbAdmin',
  'userAdmin'
]);

const availableDatabases = ref<string[]>([]);

const accordionState = ref<AccordionState>({
  dbRoles: false,
  generalRoles: false
});

const togglePassword = () => (showPassword.value = !showPassword.value);

const closeModal = () => {
  emit('close');
  resetForm();
};

const resetForm = () => {
  formData.value = {
    username: '',
    password: '',
    rolesMembership: [],
    rolesByDb: [{ db: '', role: '' }]
  };
  errorMessage.value = '';
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  successMessage.value = '';
  errorMessage.value = '';
  isSubmitting.value = true;

  if (!formData.value.username.trim() || !formData.value.password.trim()) {
    errorMessage.value = 'El nombre de usuario y la contraseña son obligatorios.';
    isSubmitting.value = false;
    return;
  }

  try {
    const validRoles = formData.value.rolesByDb
      .filter(role => role.db && role.role)
      .map(role => ({ 
        role: role.role!, 
        db: role.db! 
      }));

    const roles = [
      ...formData.value.rolesMembership.map(role => ({ role, db: 'admin' })),
      ...validRoles
    ];

    // Asignar rol por defecto si no hay ninguno
    if (roles.length === 0) {
      roles.push({ role: "read", db: "admin" });
    }

    const payload = {
      username: formData.value.username,
      password: formData.value.password,
      roles: roles
    };

    const response = await fetch('/api/mongo/createMongoUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el usuario');
    }

    successMessage.value = '¡Usuario creado exitosamente!';
    resetForm();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    isSubmitting.value = false;
  }
};

const addRoleByDb = () => {
  const lastRole = formData.value.rolesByDb[formData.value.rolesByDb.length - 1];
  if (lastRole.db && lastRole.role) {
    formData.value.rolesByDb.push({ db: '', role: '' });
  }
};

const removeRoleByDb = (index: number) => {
  formData.value.rolesByDb.splice(index, 1);
};

const removeRole = (index: number) => {
  formData.value.rolesMembership.splice(index, 1);
};

const toggleAccordion = (section: keyof AccordionState) => {
  accordionState.value[section] = !accordionState.value[section];
};

const handleDbSelect = (index: number) => {
  if (index === formData.value.rolesByDb.length - 1) {
    const lastRole = formData.value.rolesByDb[index];
    if (lastRole.db && lastRole.role) {
      formData.value.rolesByDb.push({ db: '', role: '' });
    }
  }
};

onMounted(async () => {
  try {
    const response = await fetch('/api/mongo/listDatabases');
    if (!response.ok) throw new Error('Error en la respuesta');

    const data = await response.json();

    if (Array.isArray(data)) {
      availableDatabases.value = data;
    }

    else if (data.databases && Array.isArray(data.databases)) {
      availableDatabases.value = data.databases.map((db: any) => db.name);
    }

    if (availableDatabases.value.length === 0) {
      errorMessage.value = 'No se encontraron bases de datos';
    }
  } catch (error) {
    console.error('Error:', error);
    availableDatabases.value = [];
    errorMessage.value = 'Error cargando bases de datos';
  }
});

watch([successMessage, errorMessage], () => {
  if (successMessage.value || errorMessage.value) {
    setTimeout(() => {
      successMessage.value = '';
      errorMessage.value = '';
    }, 5000);
  }
});

watch(() => props.isOpen, (newValue) => {
  if (newValue) resetForm();
});
</script>
