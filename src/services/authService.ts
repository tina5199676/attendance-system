import type { LoginPayload, LoginResult } from '@/types/auth'
import type { User } from '@/types/user'
import { MOCK_ACCOUNTS } from './mock/accounts'

/**
 * 登入相關的 API 服務。
 *
 * 目前後端 API 尚未確認，這裡先用 mock 資料模擬「有延遲、可能失敗」的請求行為，
 * 讓頁面的 Loading / Error 狀態可以先開發與測試。
 * 之後串接真實 API 時，只需把函式內容換成 http.post(...) 即可，呼叫端不必修改。
 */

const TOKEN_PREFIX = 'mock-token-'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  await delay(600)

  const email = payload.email.trim().toLowerCase()
  const account = MOCK_ACCOUNTS.find(
    (item) => item.email === email && item.password === payload.password,
  )

  if (!account) {
    throw new Error('帳號或密碼錯誤，請再試一次')
  }

  if (!account.user.isActive) {
    throw new Error('此帳號已停用，請聯絡系統管理員')
  }

  return {
    token: `${TOKEN_PREFIX}${account.user.id}`,
    user: account.user,
  }
}

/** 用保存的 token 取回目前登入的使用者（重新整理頁面時使用） */
export async function fetchCurrentUser(token: string): Promise<User> {
  await delay(300)

  const id = Number(token.replace(TOKEN_PREFIX, ''))
  const account = MOCK_ACCOUNTS.find((item) => item.user.id === id)

  if (!account) {
    throw new Error('登入狀態已失效，請重新登入')
  }

  return account.user
}

export async function logout(): Promise<void> {
  await delay(100)
}
