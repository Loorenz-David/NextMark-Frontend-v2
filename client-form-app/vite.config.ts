import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// TODO: set base URL and API proxy target from env
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // TODO: use env var
        changeOrigin: true,
      },
    },
  },
});
