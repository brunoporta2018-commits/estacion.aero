import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Rutas relativas: el build (dist/) funciona en cualquier carpeta del hosting
  base: './',
  server: {
    // En desarrollo se usa un proxy para evitar problemas de CORS
    proxy: {
      '/api': {
        target: 'https://meteorologia.sanfrancisco.utn.edu.ar',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
base: '/estacion.aero/',
  
