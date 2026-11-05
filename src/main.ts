import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Pinia 要先於 router 安裝，路由守衛內才能使用 store
createApp(App).use(createPinia()).use(router).mount('#app')
