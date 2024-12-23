import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dynamicImport from "vite-plugin-dynamic-import";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/lnuqlwcfdxstcdbjfyun\.supabase\.co\/rest\/v1\/.*$/, // Ajusta la URL de Supabase
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // Cache por 1 día
              },
            },
          },
          {
            urlPattern: /\.(js|css)$/, // Match all JS and CSS files
            handler: 'StaleWhileRevalidate',
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: false,
        globPatterns: ["**/*.{js,css,html}"],
      },
    }),
    react({
      babel: {
        plugins: ["babel-plugin-macros"],
      },
    }),
    dynamicImport(),
  ],
  assetsInclude: ["**/*.md"],
  resolve: {
    alias: {
      "@": path.join(__dirname, "src"),
    },
  },
  build: {
    outDir: "build",
  },
});
