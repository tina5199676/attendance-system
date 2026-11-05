/// <reference types="vite/client" />

// 宣告專案會用到的環境變數，讓 import.meta.env 有明確型別而不是 any
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
