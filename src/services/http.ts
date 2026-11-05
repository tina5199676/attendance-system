import axios from 'axios'

/**
 * 全專案共用的 Axios 實例。
 *
 * - baseURL 來自環境變數 VITE_API_BASE_URL，未設定時預設為 /api
 * - 之後各 service 一律透過這個實例發送請求，方便統一處理 header 與錯誤
 *
 * TODO: 後端驗證方式確認後，在此加入 request 攔截器附加 Authorization header。
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
})
