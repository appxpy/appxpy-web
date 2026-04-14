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
          if (id.includes('three-stdlib') || id.includes('@react-three/drei')) return 'drei'
          if (id.includes('three')) return 'three'
          if (id.includes('@react-three/fiber')) return 'fiber'
          if (id.includes('react-dom') || id.includes('scheduler')) return 'react-dom'
          if (id.includes('react')) return 'react'
          return 'vendor'
        },
      },
    },
  },
})
