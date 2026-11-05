import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 讓 `@/` 指向 src/，import 路徑不必再寫一長串 ../../
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
