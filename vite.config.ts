import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages 上でコマPDFと並べる専用パス:
// https://ytwg66z59b-wq.github.io/my-ai/bunsho/
const base = process.env.GITHUB_PAGES === 'true' ? '/my-ai/bunsho/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
  },
})
