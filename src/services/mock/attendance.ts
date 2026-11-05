import type { AttendanceRecord, AttendanceStatus } from '@/types/attendance'
import { isWeekend, toDateKey } from '@/utils/date'
import { MOCK_USERS } from './users'

/**
 * 出勤假資料產生器。
 *
 * 用「固定種子」的亂數，讓每次重新整理頁面看到的紀錄都一樣，
 * 面試展示時畫面才穩定。只產生過去 90 天的平日紀錄，今天的紀錄由打卡動作建立。
 */

const DAYS_OF_HISTORY = 90

/** 簡單的線性同餘亂數（LCG），同一個 seed 永遠產生同一串數字 */
function createRandom(seed: number): () => number {
  let state = seed % 2147483647
  if (state <= 0) state += 2147483646
  return () => {
    state = (state * 16807) % 2147483647
    return state / 2147483647
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** 在 [startMinutes, endMinutes] 之間挑一個時間，轉成 'HH:mm' */
function randomTime(random: () => number, startMinutes: number, endMinutes: number): string {
  const total = Math.floor(startMinutes + random() * (endMinutes - startMinutes))
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

function pickStatus(random: () => number): AttendanceStatus {
  const roll = random()
  if (roll < 0.8) return 'normal'
  if (roll < 0.88) return 'late'
  if (roll < 0.93) return 'early_leave'
  if (roll < 0.97) return 'leave'
  return 'absent'
}

function buildRecord(id: number, userId: number, userName: string, date: Date, random: () => number): AttendanceRecord {
  const status = pickStatus(random)
  const base = { id, userId, userName, date: toDateKey(date), status }

  switch (status) {
    case 'normal':
      return { ...base, clockIn: randomTime(random, 8 * 60 + 35, 8 * 60 + 59), clockOut: randomTime(random, 18 * 60, 18 * 60 + 45) }
    case 'late':
      return { ...base, clockIn: randomTime(random, 9 * 60 + 5, 9 * 60 + 50), clockOut: randomTime(random, 18 * 60, 18 * 60 + 45) }
    case 'early_leave':
      return { ...base, clockIn: randomTime(random, 8 * 60 + 35, 8 * 60 + 59), clockOut: randomTime(random, 16 * 60 + 30, 17 * 60 + 45) }
    case 'leave':
    case 'absent':
      return { ...base, clockIn: null, clockOut: null }
  }
}

function generateRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  const today = new Date()
  let nextId = 1

  for (const user of MOCK_USERS) {
    if (user.role !== 'student') continue

    for (let offset = DAYS_OF_HISTORY; offset >= 1; offset -= 1) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
      if (isWeekend(date)) continue

      const random = createRandom(user.id * 100_000 + offset)
      records.push(buildRecord(nextId, user.id, user.name, date, random))
      nextId += 1
    }
  }

  return records
}

/** 模組層級的「資料庫」：打卡動作會直接修改這個陣列，重新整理後重置 */
export const attendanceDb: AttendanceRecord[] = generateRecords()

export function nextAttendanceId(): number {
  return attendanceDb.reduce((max, record) => Math.max(max, record.id), 0) + 1
}
