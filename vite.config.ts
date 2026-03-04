import "dotenv/config";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const port = process.env.PORT ?? "3000";
const host = process.env.HOST ?? "localhost";
const proxyHost = host === "0.0.0.0" ? "localhost" : host;
const apiTarget = `http://${proxyHost}:${port}`;
/** Полный URL API для клиента (из .env API_URL при сборке). Vite встраивает process.env.VITE_* в бандл. */
process.env.VITE_API_ORIGIN =
  process.env.API_URL?.trim() || `http://localhost:${port}`;

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "client-dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: { "/api": { target: apiTarget, changeOrigin: true } },
  },
});
