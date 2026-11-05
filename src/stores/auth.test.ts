import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from './auth'

/** 把會等待 mock 延遲的 Promise 跑完 */
async function settle<T>(promise: Promise<T>): Promise<T> {
  await vi.runAllTimersAsync()
  return promise
}

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('登入成功後保存使用者、token 並寫入 localStorage', async () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)

    await settle(auth.login({ email: 'student@demo.com', password: 'demo1234' }))

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.role).toBe('student')
    expect(auth.user?.name).toBe('王小明')
    expect(localStorage.getItem('attendance.token')).toBe(auth.token)
  })

  it('密碼錯誤時丟出錯誤且狀態不變', async () => {
    const auth = useAuthStore()
    const attempt = auth.login({ email: 'student@demo.com', password: 'wrong' })
    const assertion = expect(attempt).rejects.toThrow('帳號或密碼錯誤')
    await vi.runAllTimersAsync()
    await assertion

    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('attendance.token')).toBeNull()
  })

  it('restoreSession 能用 localStorage 的 token 還原登入', async () => {
    localStorage.setItem('attendance.token', 'mock-token-3')
    const auth = useAuthStore()

    await settle(auth.restoreSession())

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.role).toBe('admin')
  })

  it('token 無效時 restoreSession 會清除登入狀態', async () => {
    localStorage.setItem('attendance.token', 'mock-token-999')
    const auth = useAuthStore()

    await settle(auth.restoreSession())

    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('attendance.token')).toBeNull()
  })

  it('hasRole 與 logout', async () => {
    const auth = useAuthStore()
    await settle(auth.login({ email: 'admin@demo.com', password: 'demo1234' }))

    expect(auth.hasRole(['admin'])).toBe(true)
    expect(auth.hasRole(['student', 'enterprise'])).toBe(false)

    await settle(auth.logout())
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.hasRole(['admin'])).toBe(false)
  })
})
