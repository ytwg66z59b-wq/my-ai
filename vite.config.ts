import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Dedicated URL (do not overwrite コマPDF at site root):
  // https://ytwg66z59b-wq.github.io/my-ai/dragon-days/
  base: '/my-ai/dragon-days/',
})
