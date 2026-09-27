import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages project site: https://<user>.github.io/my-ai/
const base = process.env.GITHUB_PAGES === 'true' ? '/my-ai/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
  },
})
