import type { User, UserFormPayload, UserQuery } from '@/types/user'
import { MOCK_USERS, findMockUser, nextUserId } from './mock/users'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 依角色、企業、關鍵字與啟用狀態篩選使用者 */
export async function fetchUsers(query: UserQuery = {}): Promise<User[]> {
  await delay(350)

  const keyword = query.keyword?.trim().toLowerCase() ?? ''

  return MOCK_USERS.filter(
    (user) =>
      (query.role === undefined || user.role === query.role) &&
      (query.enterpriseName === undefined || user.enterpriseName === query.enterpriseName) &&
      (query.isActive === undefined || user.isActive === query.isActive) &&
      (keyword === '' || user.name.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword)),
  ).map((user) => ({ ...user }))
}

/** 目前系統內出現過的企業名稱，供表單下拉使用 */
export async function fetchEnterpriseNames(): Promise<string[]> {
  await delay(150)
  const names = MOCK_USERS.map((user) => user.enterpriseName).filter((name): name is string => name !== null)
  return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'zh-Hant'))
}

function assertEmailAvailable(email: string, excludeId?: number): void {
  const taken = MOCK_USERS.some((user) => user.email === email && user.id !== excludeId)
  if (taken) throw new Error('這個電子郵件已經被使用')
}

function normalize(payload: UserFormPayload): UserFormPayload {
  return {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    role: payload.role,
    enterpriseName: payload.role === 'admin' ? null : (payload.enterpriseName?.trim() || null),
  }
}

export async function createUser(payload: UserFormPayload): Promise<User> {
  await delay(600)

  const data = normalize(payload)
  assertEmailAvailable(data.email)

  const user: User = { id: nextUserId(), ...data, isActive: true }
  MOCK_USERS.push(user)
  return { ...user }
}

export async function updateUser(id: number, payload: UserFormPayload): Promise<User> {
  await delay(600)

  const user = findMockUser(id)
  if (!user) throw new Error('找不到這位使用者')

  const data = normalize(payload)
  assertEmailAvailable(data.email, id)

  Object.assign(user, data)
  return { ...user }
}

/** 停用或啟用帳號：不刪資料，保留歷史出勤與請假紀錄 */
export async function setUserActive(id: number, isActive: boolean): Promise<User> {
  await delay(400)

  const user = findMockUser(id)
  if (!user) throw new Error('找不到這位使用者')

  user.isActive = isActive
  return { ...user }
}
