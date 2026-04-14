import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), glsl()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // Three + all R3F/drei/maath/stdlib deps live together to avoid
          // circular chunk warnings
          if (
            id.includes('/three/') ||
            id.includes('three-stdlib') ||
            id.includes('@react-three') ||
            id.includes('/maath/') ||
            id.includes('troika') ||
            id.includes('meshline')
          ) {
            return 'three'
          }
          return 'vendor'
        },
      },
    },
  },
})
