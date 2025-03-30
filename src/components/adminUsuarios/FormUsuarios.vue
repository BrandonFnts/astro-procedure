<template>
  <div>
    <!-- Modal -->
    <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="max-w-6xl w-full bg-white rounded-lg shadow-md overflow-auto">
        <!-- Encabezado del Modal -->
        <div class="flex justify-between items-center p-4 border-b">
          <h2 class="text-2xl font-bold text-gray-800">Configuración de Seguridad de Base de Datos</h2>
          <button @click="$emit('close')"
            class="text-gray-500 hover:text-gray-700 text-3xl leading-none">&times;</button>
        </div>
        <div class="p-6">
          <!-- Mensajes de estado -->
          <div v-if="successMessage" class="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {{ errorMessage }}
          </div>

          <!-- Acordeones -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Accordion: Información Principal -->
            <div>
              <button @click="toggleSection('info')" type="button"
                class="w-full flex justify-between items-center bg-gray-100 p-3 rounded-md focus:outline-none">
                <span class="font-semibold text-gray-800">Información Principal</span>
                <svg :class="{ 'transform rotate-180': isSectionOpen.info }"
                  class="w-5 h-5 text-gray-600 transition-transform" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-show="isSectionOpen.info" class="mt-4 space-y-4">
                <!-- Contenido de Información Principal -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Login Name <span class="text-red-500">*</span>
                  </label>
                  <input v-model="formData.loginName" type="text" required
                    class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    User Name <span class="text-red-500">*</span>
                  </label>
                  <input v-model="formData.userName" type="text" required
                    class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Password <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" required
                      class="w-full px-3 py-2 border rounded-md pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    <button type="button" @click="showPassword = !showPassword"
                      class="absolute inset-y-0 right-0 px-3 flex items-center">
                      <span class="text-sm">{{ showPassword ? '🙈' : '👁️' }}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Database Name <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input v-model="databaseSearch" type="text" @focus="handleDropdownFocus" @blur="handleDropdownBlur"
                      placeholder="Search database..."
                      class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">

                    <!-- Loading Spinner -->
                    <div v-if="loadingDatabases" class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                      </svg>
                    </div>

                    <!-- Dropdown Options -->
                    <div v-show="showDropdown && databaseSearch.length > 0"
                      class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                      <div v-if="filteredDatabases.length === 0" class="px-4 py-2 text-gray-500">
                        {{ loadingDatabases ? 'Searching databases...' : 'No databases found' }}
                      </div>

                      <div v-for="db in filteredDatabases" :key="db.DatabaseName"
                        @mousedown.prevent="selectDatabase(db)"
                        class="cursor-pointer hover:bg-blue-50 px-4 py-2 transition-colors duration-200">
                        <div class="font-medium text-gray-900">{{ db.DatabaseName }}</div>
                        <div class="text-xs text-gray-500 mt-1">
                          Created: {{ formatDate(db.CreationDate) }} |
                          Status: <span :class="statusColor(db.Status)">{{ db.Status }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Campo oculto para el valor seleccionado -->
                  <input v-model="formData.databaseName" type="hidden" required>
                </div>
              </div>

              <!-- Accordion: Permisos -->
              <div class="mt-6">
                <button @click="toggleSection('permissions')" type="button"
                  class="w-full flex justify-between items-center bg-gray-100 p-3 rounded-md focus:outline-none">
                  <span class="font-semibold text-gray-800">Permisos</span>
                  <svg :class="{ 'transform rotate-180': isSectionOpen.permissions }"
                    class="w-5 h-5 text-gray-600 transition-transform" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div v-show="isSectionOpen.permissions" class="mt-4 space-y-4">
                  <!-- Contenido de Permisos -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Permisos de Tablas (Formato: esquema.tabla:permiso1,permiso2; ...)
                    </label>
                    <textarea v-model="formData.tablesPermissions"
                      placeholder="Ej: dbo.Users:SELECT,INSERT; Sales.Orders:UPDATE"
                      class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"></textarea>
                    <!-- Mensaje de error en tiempo real -->
                    <div v-if="formData.tablesPermissions && !isValidPermissionFormat(formData.tablesPermissions)"
                      class="mt-1 text-sm text-red-600">
                      Formato inválido. Ejemplo correcto: <strong>dbo.Users:SELECT,INSERT; Sales.Orders:UPDATE</strong>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Permisos de Esquemas (Formato: esquema:permiso1,permiso2; ...)
                    </label>
                    <textarea v-model="formData.schemasPermissions" placeholder="Ej: dbo:SELECT,INSERT; Sales:UPDATE"
                      class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"></textarea>
                      <!-- Mensaje de error en tiempo real -->
                    <div v-if="formData.schemasPermissions && !isValidSchemaFormat(formData.schemasPermissions)"
                      class="mt-1 text-sm text-red-600">
                      Formato inválido. Ejemplo correcto: <strong>dbo:SELECT,INSERT; Sales:UPDATE</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Accordion: Roles -->
              <div class="mt-6">
                <button @click="toggleSection('roles')" type="button"
                  class="w-full flex justify-between items-center bg-gray-100 p-3 rounded-md focus:outline-none">
                  <span class="font-semibold text-gray-800">Roles</span>
                  <svg :class="{ 'transform rotate-180': isSectionOpen.roles }"
                    class="w-5 h-5 text-gray-600 transition-transform" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div v-show="isSectionOpen.roles" class="mt-4 space-y-4">
                  <!-- Contenido de Roles -->
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Asignación de Roles</h3>
                    <div class="flex flex-wrap gap-2 mb-4">
                      <div v-for="(role, index) in formData.rolesMembership" :key="index"
                        class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                        {{ role }}
                        <button type="button" @click="formData.rolesMembership.splice(index, 1)"
                          class="ml-2 text-blue-600 hover:text-blue-800">
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="grid grid-cols-1 gap-3 mb-4">
                      <label v-for="role in commonRoles" :key="role"
                        class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        :class="{ 'bg-blue-50 border-blue-300': formData.rolesMembership.includes(role) }">
                        <input type="checkbox" v-model="formData.rolesMembership" :value="role"
                          class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
                        <span class="ml-3 text-sm text-gray-700">{{ role }}</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Crear Roles (separados por coma)
                    </label>
                    <input v-model="formData.createRoles" type="text" placeholder="Ej: role1, role2"
                      class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <!-- Botón de envío -->
              <div class="mt-6 flex justify-end space-x-4">
                <!-- Botón de Guardar -->
                <button type="submit" :disabled="isLoading"
                  class="bg-orange-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-300 flex items-center justify-center">
                  <span v-if="isLoading" class="flex items-center">
                    <svg class="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.145 5.88 3 7.688l3-2.397z">
                      </path>
                    </svg>
                    Cargando...
                  </span>
                  <span v-else>Guardar Configuración</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import debounce from 'lodash/debounce';

interface Database {
  DatabaseName: string;
  CreationDate: string;
  CompatibilityLevel: number;
  Status: string;
}

interface FormData {
  loginName: string;
  password: string;
  userName: string;
  databaseName: string;
  tablesPermissions: string;
  schemasPermissions: string;
  rolesMembership: string[];
  createRoles: string;
}

defineProps({
  isOpen: Boolean
});

const commonRoles = ref([
  'db_datareader',
  'db_datawriter',
  'db_owner',
  'public',
  'custom_report_role'
]);

const formData = ref<FormData>({
  loginName: '',
  password: '',
  userName: '',
  databaseName: '',
  tablesPermissions: '',
  schemasPermissions: '',
  rolesMembership: [],
  createRoles: ''
});

const isLoading = ref(false);
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const showPassword = ref(false);
const showModal = ref(false);

// Estados para el dropdown de bases de datos
const databaseSearch = ref('');
const showDropdown = ref(false);
const filteredDatabases = ref<Database[]>([]);
const loadingDatabases = ref(false);

// Secciones acordeón
const isSectionOpen = ref({
  info: true,
  permissions: false,
  roles: false
});

// Búsqueda de bases de datos
const searchDatabases = debounce(async (searchTerm: string) => {
  try {
    loadingDatabases.value = true;
    const response = await fetch('/api/sqlServer/getUserDatabases', {
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Validaciones
const isValidName = (name: string) => {
  return /^[a-zA-Z0-9_]{4,50}$/.test(name);
};

const isValidPermissionFormat = (input: string) => {
  const pattern = /^[\w]+\.[\w]+:(SELECT|INSERT|UPDATE|DELETE|EXECUTE|REFERENCES)(,(SELECT|INSERT|UPDATE|DELETE|EXECUTE|REFERENCES))*$/;
  return input.split(';').every(part => pattern.test(part.trim()));
};

const isValidSchemaFormat = (input: string) => {
  const pattern = /^[\w]+:(SELECT|INSERT|UPDATE|DELETE|EXECUTE|REFERENCES)(,(SELECT|INSERT|UPDATE|DELETE|EXECUTE|REFERENCES))*$/;
  return input.split(';').every(part => pattern.test(part.trim()));
};

const validateForm = () => {
  const requiredFields = ['loginName', 'password', 'userName', 'databaseName'];
  const isValid = requiredFields.every(field => !!formData.value[field as keyof FormData]);

  if (!isValidName(formData.value.loginName)) {
    errorMessage.value = 'Nombre de login inválido (solo letras, números y guiones bajos, 4-50 caracteres)';
    return false;
  }

  if (!isValidName(formData.value.userName)) {
    errorMessage.value = 'Nombre de usuario inválido';
    return false;
  }

  return isValid;
};

// Manejo del modal
const closeModal = () => {
  showModal.value = false;
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
  databaseSearch.value = '';
  filteredDatabases.value = [];
  successMessage.value = '';
  errorMessage.value = '';
};

// Envío del formulario
const handleSubmit = async () => {
  if (isSubmitting.value) return;

  successMessage.value = '';
  errorMessage.value = '';
  isSubmitting.value = true;

  if (!validateForm()) {
    isSubmitting.value = false;
    return;
  }

  if (formData.value.tablesPermissions && !isValidPermissionFormat(formData.value.tablesPermissions)) {
    errorMessage.value = 'Formato de permisos inválido. Ejemplo: dbo.Tabla1:SELECT,INSERT; esquema2.Tabla2:UPDATE';
    isSubmitting.value = false;
    return;
  }

  try {
    const payload = {
      ...formData.value,
      rolesMembership: formData.value.rolesMembership.join(',')
    };

    const response = await fetch('/api/sqlServer/createUsers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.message || 'Error al configurar la seguridad');
    }

    successMessage.value = '¡Configuración aplicada exitosamente!';

  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    isSubmitting.value = false;
  }
};

// Auto-cierre de mensajes
watch([successMessage, errorMessage], () => {
  if (successMessage.value || errorMessage.value) {
    setTimeout(() => {
      successMessage.value = '';
      errorMessage.value = '';
    }, 5000);
  }
});

// Toggle secciones
const toggleSection = (section: keyof typeof isSectionOpen.value) => {
  if (isSectionOpen.value[section]) {
    isSectionOpen.value[section] = false;
  } else {
    Object.keys(isSectionOpen.value).forEach(key => {
      isSectionOpen.value[key as keyof typeof isSectionOpen.value] = false;
    });
    isSectionOpen.value[section] = true;
  }
};

const statusColor = (status: string) => {
  return {
    'text-green-600': status === 'ONLINE',
    'text-red-600': status === 'OFFLINE',
    'text-yellow-600': status === 'RESTORING'
  };
};

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
</script>