import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js', // Use the build with the template compiler
    }
  },
  server: {
    proxy: {
        '/api': {
            target: 'http://127.0.0.1:8000', // Laravel backend URL
            // target: 'https://azonation.com/backend', // Laravel backend URL for production phase
            changeOrigin: true,
            secure: false, // true if using https in production
        },
    },
},
})
