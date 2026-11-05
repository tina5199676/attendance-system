import { computed, ref, watchEffect } from 'vue'
import { defineStore } from 'pinia'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'attendance.theme'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // localStorage 不可用（例如隱私模式）時就當作沒有儲存
  }
  return 'system'
}

/**
 * 主題偏好。
 * - preference 是使用者的選擇（淺色、深色、跟隨系統）
 * - resolved 是實際套用的主題，跟隨系統時會隨作業系統設定即時變化
 * - init() 把 resolved 同步到 <html data-theme>，CSS 再依此切換整組 token
 */
export const useThemeStore = defineStore('theme', () => {
  const preference = ref<ThemePreference>(readStoredPreference())
  const systemPrefersDark = ref(typeof window !== 'undefined' && window.matchMedia(MEDIA_QUERY).matches)

  const resolved = computed<ResolvedTheme>(() => {
    if (preference.value === 'system') return systemPrefersDark.value ? 'dark' : 'light'
    return preference.value
  })

  function setPreference(value: ThemePreference): void {
    preference.value = value
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // 寫入失敗不影響本次切換
    }
  }

  let initialized = false

  function init(): void {
    if (initialized) return
    initialized = true

    const media = window.matchMedia(MEDIA_QUERY)
    media.addEventListener('change', (event) => {
      systemPrefersDark.value = event.matches
    })

    // resolved 一變就寫到 <html>，CSS 的 :root[data-theme='dark'] 會自動生效
    watchEffect(() => {
      document.documentElement.dataset.theme = resolved.value
    })
  }

  return { preference, resolved, setPreference, init }
})
