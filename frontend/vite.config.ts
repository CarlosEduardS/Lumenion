import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Aponta para a pasta wwwroot do .NET MAUI que está um nível acima
    outDir: '../wwwroot',
    emptyOutDir: false,
  }
})