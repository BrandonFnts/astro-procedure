<template>
  <div class="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Configuración de Seguridad de Base de Datos</h2>
    
    <!-- Mensajes de estado -->
    <div v-if="successMessage" class="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Campos principales - 2 columnas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Columna Izquierda -->
        <div class="space-y-4">
          <!-- Login -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Login Name <span class="text-red-500">*</span></label>
            <input
              v-model="formData.loginName"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- User Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">User Name <span class="text-red-500">*</span></label>
            <input
              v-model="formData.userName"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Columna Derecha -->
        <div class="space-y-4">
          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password <span class="text-red-500">*</span></label>
            <div class="relative">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-3 py-2 border rounded-md pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                <span class="text-sm">{{ showPassword ? '🙈' : '👁️' }}</span>
              </button>
            </div>
          </div>

          <!-- Database Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Database Name <span class="text-red-500">*</span></label>
            <input
              v-model="formData.databaseName"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Sección de Permisos y Roles - 2 columnas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Columna Izquierda - Permisos -->
        <div class="space-y-6">
          <!-- Permisos de Tablas -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Permisos de Tablas (Formato: esquema.tabla:permiso1,permiso2; ...)
            </label>
            <textarea
              v-model="formData.tablesPermissions"
              placeholder="Ej: dbo.Users:SELECT,INSERT; Sales.Orders:UPDATE"
              class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
            ></textarea>
          </div>

          <!-- Permisos de Esquemas -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Permisos de Esquemas (Formato: esquema:permiso1,permiso2; ...)
            </label>
            <textarea
              v-model="formData.schemasPermissions"
              placeholder="Ej: dbo:SELECT,INSERT; Sales:UPDATE"
              class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
            ></textarea>
          </div>
        </div>

        <!-- Columna Derecha - Roles -->
        <div class="space-y-6">
          <!-- Asignación de Roles -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Asignación de Roles</h3>
            <div class="flex flex-wrap gap-2 mb-4">
              <div 
                v-for="(role, index) in formData.rolesMembership" 
                :key="index"
                class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {{ role }}
                <button
                  type="button"
                  @click="formData.rolesMembership.splice(index, 1)"
                  class="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-3 mb-4">
              <label
                v-for="role in commonRoles"
                :key="role"
                class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{ 'bg-blue-50 border-blue-300': formData.rolesMembership.includes(role) }"
              >
                <input
                  type="checkbox"
                  v-model="formData.rolesMembership"
                  :value="role"
                  class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                >
                <span class="ml-3 text-sm text-gray-700">{{ role }}</span>
              </label>
            </div>
          </div>

          <!-- Crear Roles -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Crear Roles (separados por coma)</label>
            <input
              v-model="formData.createRoles"
              type="text"
              placeholder="Ej: role1, role2"
              class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Botón de envío -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors disabled:bg-gray-300 flex items-center justify-center"
      >
        <span v-if="isLoading" class="flex items-center">
          <svg class="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Procesando...
        </span>
        <span v-else>Aplicar Configuración de Seguridad</span>
      </button>
    </form>

    <!-- Nota de formato -->
    <div class="mt-6 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
      <p class="font-semibold mb-2">Notas de formato:</p>
      <p>• Permisos válidos: SELECT, INSERT, UPDATE, DELETE, EXECUTE, REFERENCES</p>
      <p>• Ejemplo completo: dbo.Tabla1:SELECT,INSERT; esquema2.Tabla2:UPDATE,DELETE</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Datos simulados de roles comunes
const commonRoles = ref([
  'db_datareader',
  'db_datawriter',
  'db_owner',
  'public',
  'custom_report_role'
]);

const formData = ref({
  loginName: '',
  password: '',
  userName: '',
  databaseName: '',
  tablesPermissions: '',
  schemasPermissions: '',
  rolesMembership: [] as string[],
  createRoles: ''
});

const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const showPassword = ref(false);

// Validación del formulario
const validateForm = () => {
  const requiredFields = ['loginName', 'password', 'userName', 'databaseName'];
  return requiredFields.every(field => !!formData.value[field as keyof typeof formData.value]);
};

// Validación de formato de permisos
const isValidPermissionFormat = (input: string) => {
  const pattern = /^([\w]+\.)?[\w]+:(SELECT|INSERT|UPDATE|DELETE|EXECUTE|REFERENCES)(,(SELECT|INSERT|UPDATE|DELETE|EXECUTE|REFERENCES))*$/;
  return input.split(';').every(part => pattern.test(part.trim()));
};



// Envío del formulario
const handleSubmit = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  
  if (!validateForm()) {
    errorMessage.value = 'Por favor completa todos los campos requeridos';
    return;
  }

  if (formData.value.tablesPermissions && !isValidPermissionFormat(formData.value.tablesPermissions)) {
    errorMessage.value = 'Formato de permisos de tablas inválido. Ejemplo: dbo.Tabla1:SELECT,INSERT; esquema2.Tabla2:UPDATE';
    return;
  }

  // Opcional: agregar validación para schemasPermissions si es necesario

  try {
    isLoading.value = true;
    
    // Prepara los datos para la API
    const payload = {
      ...formData.value,
      rolesMembership: formData.value.rolesMembership.join(',')
    };

    const response = await fetch('/api/createUsers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al configurar la seguridad');
    }

    successMessage.value = 'Configuración de seguridad aplicada exitosamente!';
    formData.value = {
      loginName: '',
      password: '',
      userName: '',
      databaseName: '',
      tablesPermissions: '',
      schemasPermissions: '',
      rolesMembership: [],
      createRoles: ''
    };
    
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    isLoading.value = false;
  }
};
</script>  