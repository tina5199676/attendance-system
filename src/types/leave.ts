export type LeaveType = 'personal' | 'sick' | 'annual' | 'official'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface LeaveRequest {
  id: number
  userId: number
  userName: string
  enterpriseName: string | null
  type: LeaveType
  /** 'YYYY-MM-DD'，含起訖日 */
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  /** 申請日 'YYYY-MM-DD' */
  createdAt: string
  reviewedAt: string | null
  reviewComment: string | null
}

/** 學員送出申請時的表單資料 */
export interface LeaveFormPayload {
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
}

export interface LeaveQuery {
  userId?: number
  enterpriseName?: string
  status?: LeaveStatus
}

export type LeaveDecision = Exclude<LeaveStatus, 'pending'>

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  personal: '事假',
  sick: '病假',
  annual: '特休',
  official: '公假',
}

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: '待審核',
  approved: '已核准',
  rejected: '已駁回',
}
