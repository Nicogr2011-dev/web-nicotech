import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ command, mode }) => {
  // El Client ID de Google se incrusta al compilar: sin .env, el botón de Google
  // sale roto en producción sin que nada avise (pasó en 16.08.26.16.8).
  if (command === "build" && !loadEnv(mode, process.cwd(), "VITE_").VITE_GOOGLE_CLIENT_ID) {
    throw new Error("Falta VITE_GOOGLE_CLIENT_ID en .env — copia .env.example y rellénalo antes de compilar.");
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
