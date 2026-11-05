import {
  WORK_END,
  WORK_START,
  type AttendanceQuery,
  type AttendanceRecord,
} from '@/types/attendance'
import { timeToMinutes, toDateKey, toTimeString } from '@/utils/date'
import { attendanceDb, nextAttendanceId } from './mock/attendance'
import { findMockUser } from './mock/users'

/**
 * 出勤相關的 API 服務（mock 版）。
 * 每個函式都回傳 Promise 並加上延遲，讓呼叫端用 async/await 的方式與真實 API 一致。
 */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 查詢某月份的出勤紀錄，可再依使用者或企業縮小範圍，結果由新到舊排序 */
export async function fetchAttendanceRecords(query: AttendanceQuery): Promise<AttendanceRecord[]> {
  await delay(500)

  return attendanceDb
    .filter((record) => {
      if (!record.date.startsWith(query.month)) return false
      if (query.userId !== undefined && record.userId !== query.userId) return false
      if (query.enterpriseName !== undefined) {
        const owner = findMockUser(record.userId)
        if (owner?.enterpriseName !== query.enterpriseName) return false
      }
      return true
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.userId - b.userId))
}

/** 取得某位使用者今天的紀錄；尚未打卡時回傳 null */
export async function fetchTodayRecord(userId: number): Promise<AttendanceRecord | null> {
  await delay(300)
  const today = toDateKey(new Date())
  return attendanceDb.find((record) => record.userId === userId && record.date === today) ?? null
}

/** 上班打卡：建立今天的紀錄，晚於 WORK_START 視為遲到 */
export async function clockIn(userId: number): Promise<AttendanceRecord> {
  await delay(600)

  const user = findMockUser(userId)
  if (!user) throw new Error('找不到使用者')

  const now = new Date()
  const today = toDateKey(now)
  const existing = attendanceDb.find((record) => record.userId === userId && record.date === today)
  if (existing) throw new Error('今天已經打過上班卡了')

  const time = toTimeString(now)
  const record: AttendanceRecord = {
    id: nextAttendanceId(),
    userId,
    userName: user.name,
    date: today,
    clockIn: time,
    clockOut: null,
    status: timeToMinutes(time) > timeToMinutes(WORK_START) ? 'late' : 'normal',
  }

  attendanceDb.push(record)
  return record
}

/** 下班打卡：補上下班時間，早於 WORK_END 視為早退（遲到的狀態保留不覆蓋） */
export async function clockOut(userId: number): Promise<AttendanceRecord> {
  await delay(600)

  const today = toDateKey(new Date())
  const record = attendanceDb.find((item) => item.userId === userId && item.date === today)

  if (!record || !record.clockIn) throw new Error('請先打上班卡')
  if (record.clockOut) throw new Error('今天已經打過下班卡了')

  const time = toTimeString(new Date())
  record.clockOut = time

  if (record.status === 'normal' && timeToMinutes(time) < timeToMinutes(WORK_END)) {
    record.status = 'early_leave'
  }

  return { ...record }
}
