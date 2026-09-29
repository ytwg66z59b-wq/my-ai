import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base works for local dev and GitHub Pages (/my-ai/).
  base: './',
  plugins: [react()],
})
