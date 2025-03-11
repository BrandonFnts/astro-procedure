<template>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ label }} <span v-if="required" class="text-red-500">*</span>
      </label>
      <input
        :type="type"
        :placeholder="placeholder"
        :min="min"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </template>
  
  <script>
  export default {
    name: "InputField",
    props: {
      modelValue: { type: [String, Number], default: '' },
      label: { type: String, default: '' },
      placeholder: { type: String, default: '' },
      type: { type: String, default: 'text' },
      min: { type: [Number, String], default: null },
      required: { type: Boolean, default: false },
    },
  };
  </script>
  