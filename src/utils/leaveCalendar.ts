import type { LeaveRequest } from '@/types/leave'
import { eachDateKey, isWeekend, monthGridDays, parseDateKey, toDateKey } from './date'

export interface CalendarDay {
  key: string
  /** 幾號 */
  day: number
  inMonth: boolean
  isWeekend: boolean
  isToday: boolean
  /** 當天有效的申請（已駁回不列入） */
  requests: LeaveRequest[]
  approvedCount: number
  pendingCount: number
}

/**
 * 把請假申請展開成月曆上每一天的資料。
 * 一筆跨多天的申請會出現在每一個涵蓋到的日期格子裡。
 */
export function buildLeaveCalendar(monthKey: string, requests: LeaveRequest[]): CalendarDay[] {
  const today = toDateKey(new Date())
  const byDate = new Map<string, LeaveRequest[]>()

  for (const request of requests) {
    if (request.status === 'rejected') continue
    for (const key of eachDateKey(request.startDate, request.endDate)) {
      const list = byDate.get(key)
      if (list) list.push(request)
      else byDate.set(key, [request])
    }
  }

  return monthGridDays(monthKey).map((key) => {
    const list = byDate.get(key) ?? []
    const date = parseDateKey(key)
    return {
      key,
      day: date.getDate(),
      inMonth: key.startsWith(monthKey),
      isWeekend: isWeekend(date),
      isToday: key === today,
      requests: list,
      approvedCount: list.filter((item) => item.status === 'approved').length,
      pendingCount: list.filter((item) => item.status === 'pending').length,
    }
  })
}

export interface CalendarSummary {
  /** 本月核准請假的總人日 */
  approvedDays: number
  /** 同一天最多幾人核准請假 */
  peakCount: number
  peakDate: string | null
  pendingRequests: number
}

export function summarizeCalendar(days: CalendarDay[]): CalendarSummary {
  let approvedDays = 0
  let peakCount = 0
  let peakDate: string | null = null
  const pendingIds = new Set<number>()

  for (const day of days) {
    if (!day.inMonth) continue
    approvedDays += day.approvedCount
    if (day.approvedCount > peakCount) {
      peakCount = day.approvedCount
      peakDate = day.key
    }
    for (const request of day.requests) {
      if (request.status === 'pending') pendingIds.add(request.id)
    }
  }

  return { approvedDays, peakCount, peakDate, pendingRequests: pendingIds.size }
}
