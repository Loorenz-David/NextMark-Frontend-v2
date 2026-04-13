import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      devOptions: {
        enabled: false,
      },
      includeAssets: [
        "pwa-icon-192.png",
        "pwa-icon-512.png",
        "pwa-maskable-512.png",
        "apple-touch-icon.png",
      ],
      manifest: {
        id: "/",
        name: "Next Mark",
        short_name: "Next Mark",
        description:
          "Installable driver workspace for route execution and delivery operations.",
        theme_color: "#1f6f5d",
        background_color: "#f3ede2",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        globPatterns: ["**/*.{js,css,svg,png,ico,webmanifest}"],
        globIgnores: ["**/index.html"],
        runtimeCaching: [],
        navigateFallback: null,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  build: {
    cssTarget: ['chrome90', 'firefox90', 'safari15.4', 'edge90'],
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@app", replacement: path.resolve(__dirname, "src/shared") },
      {
        find: "@features",
        replacement: path.resolve(__dirname, "src/features"),
      },
      {
        find: "@packages",
        replacement: path.resolve(__dirname, "../packages"),
      },
      {
        find: /^zustand$/,
        replacement: path.resolve(
          __dirname,
          "./node_modules/zustand/esm/index.mjs",
        ),
      },
      {
        find: /^zustand\/react$/,
        replacement: path.resolve(
          __dirname,
          "./node_modules/zustand/esm/react.mjs",
        ),
      },
      {
        find: /^zustand\/react\/shallow$/,
        replacement: path.resolve(
          __dirname,
          "./node_modules/zustand/esm/react/shallow.mjs",
        ),
      },
      {
        find: /^react$/,
        replacement: path.resolve(__dirname, "./node_modules/react/index.js"),
      },
      {
        find: /^react\/jsx-runtime$/,
        replacement: path.resolve(
          __dirname,
          "./node_modules/react/jsx-runtime.js",
        ),
      },
      {
        find: /^framer-motion$/,
        replacement: path.resolve(
          __dirname,
          "./node_modules/framer-motion/dist/es/index.mjs",
        ),
      },
      {
        find: "@shared-domain",
        replacement: path.resolve(__dirname, "../packages/shared-domain"),
      },
      {
        find: "@shared-api",
        replacement: path.resolve(__dirname, "../packages/shared-api"),
      },
      {
        find: "@shared-utils",
        replacement: path.resolve(__dirname, "../packages/shared-utils/src"),
      },
      {
        find: "@shared-store",
        replacement: path.resolve(__dirname, "../packages/shared-store/src"),
      },
      {
        find: "@shared-optimistic",
        replacement: path.resolve(
          __dirname,
          "../packages/shared-optimistic/src",
        ),
      },
      {
        find: "@shared-message-handler",
        replacement: path.resolve(
          __dirname,
          "../packages/shared-message-handler/src",
        ),
      },
      {
        find: "@shared-google-maps",
        replacement: path.resolve(__dirname, "../packages/shared-google-maps"),
      },
      {
        find: "@shared-icons",
        replacement: path.resolve(__dirname, "../packages/shared-icons"),
      },
      {
        find: "@shared-realtime",
        replacement: path.resolve(__dirname, "../packages/shared-realtime/src"),
      },
      {
        find: /^socket\.io-client$/,
        replacement: path.resolve(
          __dirname,
          "./node_modules/socket.io-client/build/esm/index.js",
        ),
      },
    ],
  },
  server: {
    host: true,
  },
});
