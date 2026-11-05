import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '@/services/authService'
import type { LoginPayload } from '@/types/auth'
import type { User, UserRole } from '@/types/user'

const TOKEN_KEY = 'attendance.token'

/**
 * 登入狀態的全域 store（Pinia setup store 寫法）。
 *
 * - ref 對應 state，computed 對應 getters，function 對應 actions
 * - token 會存進 localStorage，重新整理頁面後可透過 restoreSession 還原登入
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const restored = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  const role = computed<UserRole | null>(() => user.value?.role ?? null)

  async function login(payload: LoginPayload): Promise<void> {
    const result = await authService.login(payload)
    token.value = result.token
    user.value = result.user
    localStorage.setItem(TOKEN_KEY, result.token)
  }

  async function logout(): Promise<void> {
    await authService.logout()
    clearSession()
  }

  function clearSession(): void {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  /** 用 localStorage 內的 token 還原登入狀態；整個 app 生命週期只會執行一次 */
  async function restoreSession(): Promise<void> {
    if (restored.value) return
    restored.value = true

    if (!token.value) return

    try {
      user.value = await authService.fetchCurrentUser(token.value)
    } catch {
      clearSession()
    }
  }

  /** 判斷目前使用者是否屬於指定角色之一 */
  function hasRole(roles: readonly UserRole[]): boolean {
    return role.value !== null && roles.includes(role.value)
  }

  return { user, token, isAuthenticated, role, login, logout, restoreSession, hasRole }
})
