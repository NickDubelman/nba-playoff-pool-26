import { defineConfig } from 'astro/config'
import db from '@astrojs/db'
import svelte from '@astrojs/svelte'
import netlify from '@astrojs/netlify'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  integrations: [db(), svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'server',
  adapter: netlify(),
  security: {
    checkOrigin: false,
  },
})
