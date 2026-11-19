import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' hace que los archivos carguen bien en GitHub Pages (usuario.github.io/repositorio/)
export default defineConfig({
  plugins: [react()],
  base: './',
});
