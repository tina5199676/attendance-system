import type { AttendanceRecord } from '@/types/attendance'

export interface AttendanceSummary {
  total: number
  normal: number
  late: number
  earlyLeave: number
  absent: number
  leave: number
  /** 實際出勤天數 = 正常 + 遲到 + 早退 */
  present: number
  /** 應出勤天數 = 全部紀錄 − 請假 */
  expected: number
  /** 出勤率 0–100；沒有應出勤天數時為 null */
  rate: number | null
}

export function summarize(records: AttendanceRecord[]): AttendanceSummary {
  const counts = { normal: 0, late: 0, earlyLeave: 0, absent: 0, leave: 0 }

  for (const record of records) {
    switch (record.status) {
      case 'normal':
        counts.normal += 1
        break
      case 'late':
        counts.late += 1
        break
      case 'early_leave':
        counts.earlyLeave += 1
        break
      case 'absent':
        counts.absent += 1
        break
      case 'leave':
        counts.leave += 1
        break
    }
  }

  const present = counts.normal + counts.late + counts.earlyLeave
  const expected = records.length - counts.leave

  return {
    ...counts,
    total: records.length,
    present,
    expected,
    rate: expected > 0 ? Math.round((present / expected) * 1000) / 10 : null,
  }
}

export interface UserAnomaly {
  userId: number
  userName: string
  late: number
  earlyLeave: number
  absent: number
  total: number
}

/** 每位學員的異常次數（遲到、早退、缺勤），由多到少排序 */
export function anomaliesByUser(records: AttendanceRecord[]): UserAnomaly[] {
  const map = new Map<number, UserAnomaly>()

  for (const record of records) {
    let entry = map.get(record.userId)
    if (!entry) {
      entry = { userId: record.userId, userName: record.userName, late: 0, earlyLeave: 0, absent: 0, total: 0 }
      map.set(record.userId, entry)
    }
    if (record.status === 'late') entry.late += 1
    else if (record.status === 'early_leave') entry.earlyLeave += 1
    else if (record.status === 'absent') entry.absent += 1
  }

  return [...map.values()]
    .map((entry) => ({ ...entry, total: entry.late + entry.earlyLeave + entry.absent }))
    .sort((a, b) => b.total - a.total || a.userName.localeCompare(b.userName, 'zh-Hant'))
}

/** 產生漂亮的 Y 軸刻度：回傳 [0, step, 2*step, ...] 直到涵蓋 max */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1]
  const rough = max / count
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalized = rough / magnitude
  const step = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude
  const ticks: number[] = []
  for (let value = 0; value < max + step; value += step) ticks.push(Math.round(value * 100) / 100)
  return ticks
}
