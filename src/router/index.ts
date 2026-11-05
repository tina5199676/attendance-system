import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/user'

// 擴充 vue-router 的 RouteMeta，讓每條路由的 meta 都有型別檢查
declare module 'vue-router' {
  interface RouteMeta {
    /** 需要登入才能進入 */
    requiresAuth?: boolean
    /** 只允許未登入者進入（例如登入頁） */
    guestOnly?: boolean
    /** 允許的角色；未設定代表所有已登入角色皆可 */
    roles?: UserRole[]
    /** 頁面標題，同時用於瀏覽器分頁與側邊導覽 */
    title?: string
    /** 顯示於側邊導覽的順序；未設定代表不顯示 */
    navOrder?: number
  }
}

const APP_NAME = '出勤管理系統'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
        meta: { guestOnly: true, title: '登入' },
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'dashboard' } },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
        meta: { title: '總覽', navOrder: 1 },
      },
      {
        path: 'attendance',
        name: 'attendance',
        component: () => import('@/pages/AttendancePage.vue'),
        meta: { title: '出勤紀錄', navOrder: 2 },
      },
      {
        path: 'leave',
        name: 'leave',
        component: () => import('@/pages/LeavePage.vue'),
        meta: { title: '請假管理', navOrder: 3 },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/pages/UsersPage.vue'),
        meta: { title: '使用者管理', navOrder: 4, roles: ['admin'] },
      },
      {
        path: 'forbidden',
        name: 'forbidden',
        component: () => import('@/pages/ForbiddenPage.vue'),
        meta: { title: '沒有權限' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { title: '找不到頁面' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * 全域前置守衛：每次切換頁面前依序檢查
 * 1. 先還原登入狀態（重新整理頁面時需要）
 * 2. 需要登入的頁面 → 未登入就導向登入頁，並記住原本要去的位置
 * 3. 只給訪客的頁面 → 已登入就導向總覽
 * 4. 有角色限制的頁面 → 角色不符就導向 403
 */
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.restoreSession()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (to.meta.roles && !auth.hasRole(to.meta.roles)) {
    return { name: 'forbidden' }
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title}｜${APP_NAME}` : APP_NAME
})

export default router
