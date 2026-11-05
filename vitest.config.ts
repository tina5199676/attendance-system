import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

// 沿用 vite.config 的 plugin 與 @ 別名，只額外加上測試設定
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts'],
      restoreMocks: true,
    },
  }),
)
