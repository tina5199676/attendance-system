import type { User } from '@/types/user'

const ENTERPRISE_A = '台灣科技股份有限公司'
const ENTERPRISE_B = '新創數位有限公司'

/** 系統內所有使用者；前三位同時是可登入的測試帳號（見 accounts.ts） */
export const MOCK_USERS: User[] = [
  { id: 1, name: '王小明', email: 'student@demo.com', role: 'student', enterpriseName: ENTERPRISE_A },
  { id: 2, name: '台灣科技 人資部', email: 'enterprise@demo.com', role: 'enterprise', enterpriseName: ENTERPRISE_A },
  { id: 3, name: '系統管理員', email: 'admin@demo.com', role: 'admin', enterpriseName: null },
  { id: 4, name: '林佳穎', email: 'chiaying.lin@demo.com', role: 'student', enterpriseName: ENTERPRISE_A },
  { id: 5, name: '陳建宏', email: 'chienhung.chen@demo.com', role: 'student', enterpriseName: ENTERPRISE_A },
  { id: 6, name: '張雅婷', email: 'yating.chang@demo.com', role: 'student', enterpriseName: ENTERPRISE_B },
  { id: 7, name: '李承恩', email: 'chengen.li@demo.com', role: 'student', enterpriseName: ENTERPRISE_B },
  { id: 8, name: '新創數位 管理部', email: 'hr@startup-demo.com', role: 'enterprise', enterpriseName: ENTERPRISE_B },
]

export function findMockUser(id: number): User | undefined {
  return MOCK_USERS.find((user) => user.id === id)
}
