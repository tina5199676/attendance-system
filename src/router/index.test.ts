import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import router from './index'
import { useAuthStore } from '@/stores/auth'

/**
 * 路由守衛會在導覽途中等待 mock 服務的延遲，這裡用真實計時器讓流程自然跑完，
 * 避免假計時器與懶載入元件互相等待。
 */
async function loginAs(email: string): Promise<void> {
  await useAuthStore().login({ email, password: 'demo1234' })
}

describe('路由權限守衛', () => {
  beforeEach(async () => {
    localStorage.clear()
    setActivePinia(createPinia())
    await router.push({ name: 'login', query: { t: String(Date.now()) } })
  })

  it('未登入進入受保護頁面會導向登入頁並記住原本位置', async () => {
    await router.push('/attendance')

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/attendance')
  })

  it('已登入者不能再進入登入頁', async () => {
    await loginAs('student@demo.com')
    await router.push('/login')

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('角色不符時導向 403', async () => {
    await loginAs('student@demo.com')
    await router.push({ name: 'users' })

    expect(router.currentRoute.value.name).toBe('forbidden')
  })

  it('管理員可以進入使用者管理', async () => {
    await loginAs('admin@demo.com')
    await router.push({ name: 'users' })

    expect(router.currentRoute.value.name).toBe('users')
  })

  it('不存在的路徑顯示 404', async () => {
    await router.push('/no-such-page')
    expect(router.currentRoute.value.name).toBe('not-found')
  })
})
