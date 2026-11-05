import type { User } from '@/types/user'

/**
 * 開發用的測試帳號。
 * 後端 API 完成前，登入功能先以這份資料模擬；串接後此檔案即可移除。
 */
export interface MockAccount {
  email: string
  password: string
  user: User
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    email: 'student@demo.com',
    password: 'demo1234',
    user: {
      id: 1,
      name: '王小明',
      email: 'student@demo.com',
      role: 'student',
      enterpriseName: '台灣科技股份有限公司',
    },
  },
  {
    email: 'enterprise@demo.com',
    password: 'demo1234',
    user: {
      id: 2,
      name: '台灣科技 人資部',
      email: 'enterprise@demo.com',
      role: 'enterprise',
      enterpriseName: '台灣科技股份有限公司',
    },
  },
  {
    email: 'admin@demo.com',
    password: 'demo1234',
    user: {
      id: 3,
      name: '系統管理員',
      email: 'admin@demo.com',
      role: 'admin',
      enterpriseName: null,
    },
  },
]
