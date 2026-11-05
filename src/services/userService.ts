import type { User, UserRole } from '@/types/user'
import { MOCK_USERS } from './mock/users'

export interface UserQuery {
  role?: UserRole
  enterpriseName?: string
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 依角色與所屬企業篩選使用者 */
export async function fetchUsers(query: UserQuery = {}): Promise<User[]> {
  await delay(250)

  return MOCK_USERS.filter(
    (user) =>
      (query.role === undefined || user.role === query.role) &&
      (query.enterpriseName === undefined || user.enterpriseName === query.enterpriseName),
  )
}
