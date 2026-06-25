// vite.config.js – wird nur für "npm run dev" verwendet.
// Der Produktions-Build läuft über scripts/build.js
import { defineConfig } from 'vite'
import { svelte }       from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  root:    'src',
  plugins: [svelte()],
})
