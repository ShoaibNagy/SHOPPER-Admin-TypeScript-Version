import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@':            path.resolve(__dirname, './src'),
      '@api':         path.resolve(__dirname, './src/api'),
      '@components':  path.resolve(__dirname, './src/components'),
      '@hooks':       path.resolve(__dirname, './src/hooks'),
      '@pages':       path.resolve(__dirname, './src/pages'),
      '@store':       path.resolve(__dirname, './src/store'),
      '@styles':      path.resolve(__dirname, './src/styles'),
      '@types':       path.resolve(__dirname, './src/types'),
      '@utils':       path.resolve(__dirname, './src/utils'),
      '@router':      path.resolve(__dirname, './src/router'),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        // Auto-inject SCSS design tokens into every CSS Module,
        // so components can use $admin-sidebar-width, respond-to(), etc.
        // without a manual @use statement.
        additionalData: `
          @use "@/styles/variables" as *;
          @use "@/styles/mixins" as *;
        `,
      },
    },
  },

  server: {
    port: 5124, // distinct from the storefront (5123)
    proxy: {
      '/api': {
        target: 'http://localhost:4000/api',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react';
          if (id.includes('node_modules/react-router-dom/')) return 'router';
          if (id.includes('@tanstack/react-query')) return 'query';
          if (id.includes('node_modules/recharts/')) return 'recharts';
          if (id.includes('node_modules/zustand/')) return 'zustand';
          return undefined;
        },
      },
    },
  },
});