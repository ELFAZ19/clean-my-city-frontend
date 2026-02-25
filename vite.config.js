import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    port: 4173, // optional, Render will override PORT
    host: true,
    allowedHosts: ['clean-my-city-frontend.onrender.com'],
  },
});