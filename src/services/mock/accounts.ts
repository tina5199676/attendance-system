import type { User } from '@/types/user'
import { findMockUser } from './users'

/**
 * 可登入的測試帳號。
 * 本專案為前端作品集，沒有真實後端，登入一律以這份資料模擬。
 */
export interface MockAccount {
  email: string
  password: string
  user: User
}

function account(userId: number, password: string): MockAccount {
  const user = findMockUser(userId)
  if (!user) {
    throw new Error(`找不到 id 為 ${userId} 的測試使用者`)
  }
  return { email: user.email, password, user }
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  account(1, 'demo1234'),
  account(2, 'demo1234'),
  account(3, 'demo1234'),
]
