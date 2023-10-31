import svgr from '@svgr/rollup';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
  ],
  server: {
    host: '0.0.0.0'
  },
  build: {
    rollupOptions: {
      maxParallelFileOps: 4,
      cache: false,
      output: {
        sourcemap: false,
        manualChunks: {
          three: ['three']
        }
      },
    }
  },
})
