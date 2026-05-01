import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "", "");

  return {
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: "@shared-inputs",
          replacement: path.resolve(__dirname, "../packages/shared-inputs/src"),
        },
        {
          find: "@shared-google-maps",
          replacement: path.resolve(
            __dirname,
            "../packages/shared-google-maps",
          ),
        },
        {
          find: "@shared-domain",
          replacement: path.resolve(__dirname, "../packages/shared-domain"),
        },
        {
          find: "@shared-icons",
          replacement: path.resolve(__dirname, "../packages/shared-icons"),
        },
        {
          find: /^react$/,
          replacement: path.resolve(__dirname, "node_modules/react/index.js"),
        },
        {
          find: /^react\/jsx-runtime$/,
          replacement: path.resolve(
            __dirname,
            "node_modules/react/jsx-runtime.js",
          ),
        },
        {
          find: /^react-dom$/,
          replacement: path.resolve(
            __dirname,
            "node_modules/react-dom/index.js",
          ),
        },
        {
          find: /^libphonenumber-js$/,
          replacement: path.resolve(
            __dirname,
            "node_modules/libphonenumber-js/index.cjs.js",
          ),
        },
        {
          find: /^framer-motion$/,
          replacement: path.resolve(
            __dirname,
            "node_modules/framer-motion/dist/es/index.mjs",
          ),
        },
        {
          find: /^@floating-ui\/react$/,
          replacement: path.resolve(
            __dirname,
            "node_modules/@floating-ui/react/dist/floating-ui.react.mjs",
          ),
        },
      ],
    },
    server: {
      host: true,
      port: 5175,
      proxy: {
        "/api_v2": {
          target: env.VITE_API_BASE_URL || "http://localhost:5050",
          changeOrigin: true,
        },
      },
    },
  };
});
