import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isAdmin = mode === 'admin';

  return {
    plugins: [react(), !isAdmin && cssInjectedByJsPlugin()].filter(Boolean),
    // If admin mode, set base to /admin/ so assets load correctly from subdirectory
    base: isAdmin ? '/admin/' : '/',
    // Separate entry point for customer vs admin
    root: path.resolve(__dirname),
    build: isAdmin
      ? {
        rollupOptions: {
          input: path.resolve(__dirname, 'admin.html'),
        },
        outDir: 'dist-admin',
      }
      : {
       sourcemap: true,
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html')
      },
      outDir: 'dist',
      },
    server: {
      port: isAdmin ? 5175 : 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        }
      }
    },
  };
});
