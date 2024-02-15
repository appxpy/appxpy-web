import svgr from '@svgr/rollup';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { resolve as resolvePath } from 'path'


export default defineConfig({
  plugins: [
    react(),
    svgr(),
  ],
  server: {
    host: '0.0.0.0'
  },
  build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolvePath(__dirname, 'index.html'),
          wallpaper: resolvePath(__dirname, 'wallpaper/index.html'),
          error404: resolvePath(__dirname, '404.html')
        },
        output:{
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          }
        },
      }
  },
})
