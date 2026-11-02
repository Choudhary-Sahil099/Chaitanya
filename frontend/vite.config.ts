import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",

    allowedHosts: [
      "undercook-tummy-gloss.ngrok-free.dev",
    ],

    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },

      "/health": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});