/** 系統的三種使用者角色 */
export type UserRole = 'student' | 'enterprise' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  /** 學員與企業帳號所屬的企業名稱；系統管理員為 null */
  enterpriseName: string | null
  /** 停用的帳號無法登入，但保留歷史紀錄 */
  isActive: boolean
}

/** 新增或編輯使用者時的表單資料 */
export interface UserFormPayload {
  name: string
  email: string
  role: UserRole
  enterpriseName: string | null
}

export interface UserQuery {
  role?: UserRole
  enterpriseName?: string
  /** 以姓名或 email 模糊搜尋 */
  keyword?: string
  /** 未指定時回傳全部（含停用） */
  isActive?: boolean
}

/** 角色在畫面上顯示的中文名稱 */
export const ROLE_LABELS: Record<UserRole, string> = {
  student: '學員',
  enterprise: '企業',
  admin: '系統管理員',
}
