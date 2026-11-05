export type AttendanceStatus = 'normal' | 'late' | 'early_leave' | 'absent' | 'leave'

export interface AttendanceRecord {
  id: number
  userId: number
  userName: string
  /** 'YYYY-MM-DD' */
  date: string
  /** 'HH:mm'，尚未打卡為 null */
  clockIn: string | null
  clockOut: string | null
  status: AttendanceStatus
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  normal: '正常',
  late: '遲到',
  early_leave: '早退',
  absent: '缺勤',
  leave: '請假',
}

/** 查詢條件：month 必填，其餘用來縮小範圍 */
export interface AttendanceQuery {
  /** 'YYYY-MM' */
  month: string
  userId?: number
  enterpriseName?: string
}

/** 標準上下班時間，用來判斷遲到與早退 */
export const WORK_START = '09:00'
export const WORK_END = '18:00'
