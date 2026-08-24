import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const SERVER_PORT = process.env.SERVER_PORT ?? "3001";

// Client dev server proxies API calls to the Express backend so the app works
// as a single origin during development.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: `http://localhost:${SERVER_PORT}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
  },
});
