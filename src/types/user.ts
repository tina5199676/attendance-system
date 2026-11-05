/** 系統的三種使用者角色 */
export type UserRole = 'student' | 'enterprise' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  /** 學員與企業帳號所屬的企業名稱；系統管理員為 null */
  enterpriseName: string | null
}

/** 角色在畫面上顯示的中文名稱 */
export const ROLE_LABELS: Record<UserRole, string> = {
  student: '學員',
  enterprise: '企業',
  admin: '系統管理員',
}
