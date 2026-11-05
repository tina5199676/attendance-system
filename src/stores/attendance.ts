import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as attendanceService from '@/services/attendanceService'
import type { AttendanceQuery, AttendanceRecord, AttendanceStatus } from '@/types/attendance'

/**
 * 出勤資料的 store。
 * 把「資料 + 載入中 + 錯誤」三件事集中管理，頁面只負責呈現。
 */
export const useAttendanceStore = defineStore('attendance', () => {
  const records = ref<AttendanceRecord[]>([])
  const todayRecord = ref<AttendanceRecord | null>(null)

  const loading = ref(false)
  const error = ref('')
  const clocking = ref(false)

  /** 各狀態的筆數，用於頁面上方的摘要 */
  const summary = computed<Record<AttendanceStatus, number>>(() => {
    const counts: Record<AttendanceStatus, number> = {
      normal: 0,
      late: 0,
      early_leave: 0,
      absent: 0,
      leave: 0,
    }
    for (const record of records.value) {
      counts[record.status] += 1
    }
    return counts
  })

  async function loadRecords(query: AttendanceQuery): Promise<void> {
    loading.value = true
    error.value = ''
    try {
      records.value = await attendanceService.fetchAttendanceRecords(query)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '載入出勤紀錄失敗'
    } finally {
      loading.value = false
    }
  }

  async function loadToday(userId: number): Promise<void> {
    todayRecord.value = await attendanceService.fetchTodayRecord(userId)
  }

  /** 打卡：成功時更新 todayRecord，失敗時把錯誤往外拋，由頁面決定怎麼顯示 */
  async function clockIn(userId: number): Promise<void> {
    clocking.value = true
    try {
      todayRecord.value = await attendanceService.clockIn(userId)
    } finally {
      clocking.value = false
    }
  }

  async function clockOut(userId: number): Promise<void> {
    clocking.value = true
    try {
      todayRecord.value = await attendanceService.clockOut(userId)
    } finally {
      clocking.value = false
    }
  }

  return { records, todayRecord, loading, error, clocking, summary, loadRecords, loadToday, clockIn, clockOut }
})
