import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { BASE_PATH } from './src/sitePath';

export default defineConfig(() => {
  return {
    base: BASE_PATH,
    define: { __BASE_PATH__: JSON.stringify(BASE_PATH) },
    appType: 'mpa',
    plugins: [react(), tailwindcss(), {
      name: 'product-pages-development',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          // Production serves the HTML generated per product. Development uses React.
          if (req.url?.startsWith('/productos/')) req.url = '/index.html';
          next();
        });
      },
    }],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Allow temporary Cloudflare Quick Tunnel URLs used for mobile previews.
      allowedHosts: ['.trycloudflare.com'],
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
