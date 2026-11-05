import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastTone = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
}

const DEFAULT_DURATION = 3200

/**
 * 全站操作回饋訊息。
 * 任何頁面或 store 都能呼叫 toast.success('...')，實際畫面由 ToastList 元件負責渲染。
 */
export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 1

  function dismiss(id: number): void {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function show(message: string, tone: ToastTone = 'info', duration = DEFAULT_DURATION): void {
    const id = nextId
    nextId += 1
    toasts.value.push({ id, message, tone })
    setTimeout(() => dismiss(id), duration)
  }

  function success(message: string): void {
    show(message, 'success')
  }

  function error(message: string): void {
    show(message, 'error', DEFAULT_DURATION * 1.5)
  }

  return { toasts, show, success, error, dismiss }
})
