<template>
    <TransitionRoot appear :show="isOpen" as="template">
      <Dialog as="div" @close="closeModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black bg-opacity-30" />
        <div class="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl">
          <DialogTitle class="text-2xl font-bold text-center">Crear Base de Datos</DialogTitle>
          <p class="text-sm text-gray-600 mb-4">Los campos marcados con <span class="text-red-500">*</span> son obligatorios.</p>
          
          <div class="space-y-4">
            <Disclosure v-slot="{ open }">
              <DisclosureButton class="w-full bg-gray-100 hover:bg-orange-400 p-2 rounded-lg font-medium">
                Datos Principales
              </DisclosureButton>
              <DisclosurePanel class="p-2 space-y-3">
                <InputField v-model="form.dbname" label="Nombre de la BD" required />
                <InputField v-model="form.datafilename" label="Ruta del archivo .mdf" required />
                <InputField v-model="form.datasizeMB" label="Tamaño de datos (MB)" type="number" required min="1" />
              </DisclosurePanel>
            </Disclosure>
            
            <Disclosure v-slot="{ open }">
              <DisclosureButton class="w-full bg-gray-100 p-2 hover:bg-orange-400 rounded-lg font-medium">
                Configuración del Archivo de Datos
              </DisclosureButton>
              <DisclosurePanel class="p-2 space-y-3">
                <InputField v-model="form.datafilegrowthMB" label="Crecimiento de datos (MB)" type="number" min="0" />
                <InputField v-model="form.datafilegrowthPercent" label="Crecimiento de datos (%)" type="number" min="0" />
              </DisclosurePanel>
            </Disclosure>
            
            <Disclosure v-slot="{ open }">
              <DisclosureButton class="w-full bg-gray-100 p-2 hover:bg-orange-400 rounded-lg font-medium">
                Configuración del Archivo de Log
              </DisclosureButton>
              <DisclosurePanel class="p-2 space-y-3">
                <InputField v-model="form.logfilename" label="Ruta del archivo .ldf" required />
                <InputField v-model="form.logsizeMB" label="Tamaño del log (MB)" type="number" required min="1" />
                <InputField v-model="form.logfilegrowthMB" label="Crecimiento del log (MB)" type="number" min="0" />
                <InputField v-model="form.logfilegrowthPercent" label="Crecimiento del log (%)" type="number" min="0" />
              </DisclosurePanel>
            </Disclosure>
          </div>
  
          <div class="mt-6 flex justify-end space-x-2">
            <button @click="closeModal" class="px-4 py-2 bg-gray-300 rounded-lg">Cancelar</button>
            <button @click="submitForm" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Crear</button>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { Dialog, DialogTitle, TransitionRoot } from '@headlessui/vue';
  import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
  import InputField from '../InputField.vue';
  import Swal from 'sweetalert2';
  
  export default {
    components: { Dialog, DialogTitle, TransitionRoot, Disclosure, DisclosureButton, DisclosurePanel, InputField },
    props: { isOpen: Boolean },
    setup(props, { emit }) {
      const form = ref({
        dbname: '', datafilename: '', datasizeMB: 0, datafilegrowthMB: null, datafilegrowthPercent: null,
        logfilename: '', logsizeMB: 0, logfilegrowthMB: null, logfilegrowthPercent: null
      });
  
      function closeModal() { emit('close'); }
  
      async function submitForm() {
        try {
          if (!form.value.dbname || !form.value.datafilename || !form.value.logfilename || form.value.datasizeMB <= 0 || form.value.logsizeMB <= 0) {
            throw new Error("Faltan campos requeridos o los tamaños iniciales no son válidos.");
          }
          if ((form.value.datafilegrowthMB === null && form.value.datafilegrowthPercent === null) || (form.value.logfilegrowthMB === null && form.value.logfilegrowthPercent === null)) {
            throw new Error("Debe especificar el crecimiento del archivo de datos y log en MB o porcentaje.");
          }
          const response = await fetch('/api/createDatabase', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form.value)
          });
          const result = await response.json();
          if (response.ok) {
            Swal.fire({ icon: 'success', title: '¡Éxito!', text: result.message });
            closeModal();
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: result.message });
          }
        } catch (error) {
          Swal.fire({ icon: 'error', title: 'Error', text: error.message || "Ocurrió un error." });
        }
      }
  
      return { form, closeModal, submitForm };
    }
  };
  </script>
  