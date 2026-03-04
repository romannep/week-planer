import "dotenv/config";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const port = process.env.PORT ?? "3000";
const host = process.env.HOST ?? "localhost";
const proxyHost = host === "0.0.0.0" ? "localhost" : host;
const apiTarget = `http://${proxyHost}:${port}`;
/** URL API для подстановки в собранный клиент (из .env при сборке). Vite встраивает process.env.VITE_* в бандл. */
process.env.VITE_API_ORIGIN = `http://${host}:${port}`;

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
