import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/Nano-Banana-App/',
      server: {
        port: 3500,
        host: '0.0.0.0',
        
        // 🛠️ CORRECTION : Cette ligne autorise le domaine de Render
        allowedHosts: ['na-ora-1.onrender.com'], 
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
