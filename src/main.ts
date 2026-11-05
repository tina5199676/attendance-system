import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import './style.css'

// Pinia 要先於 router 安裝，路由守衛內才能使用 store
const app = createApp(App).use(createPinia()).use(router)

// 主題 store 在掛載前初始化，才能監聽系統偏好並同步到 <html data-theme>
useThemeStore().init()

app.mount('#app')
