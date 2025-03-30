// @ts-check
import { defineConfig } from 'astro/config';

import vue from "@astrojs/vue"
import tailwindcss from '@tailwindcss/vite';

import icon from "astro-icon";

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  base: '/',
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
  },

  adapter: node({
    mode: 'standalone'
  })
});