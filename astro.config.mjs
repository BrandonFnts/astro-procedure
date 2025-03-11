// @ts-check
import { defineConfig } from 'astro/config';

import vue from "@astrojs/vue"
import tailwindcss from '@tailwindcss/vite';

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [
    vue(),
    icon({
      include: {
        'heroicons-solid': ['*'],
        'heroicons-outline': ['*']
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});