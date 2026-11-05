import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * 假資料在模組載入時以「現在」為基準產生，所以每個測試都先固定系統時間，
 * 再用 resetModules 重新載入服務，確保資料庫是乾淨的。
 */
async function loadServiceAt(isoTime: string) {
  vi.setSystemTime(new Date(isoTime))
  vi.resetModules()
  return import('./attendanceService')
}

describe('attendanceService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('09:00 前打上班卡為正常', async () => {
    const service = await loadServiceAt('2024-03-06T08:50:00')
    const pending = service.clockIn(1)
    await vi.runAllTimersAsync()
    const record = await pending

    expect(record).toMatchObject({ userId: 1, date: '2024-03-06', clockIn: '08:50', clockOut: null, status: 'normal' })
  })

  it('09:00 後打上班卡為遲到', async () => {
    const service = await loadServiceAt('2024-03-06T09:20:00')
    const pending = service.clockIn(1)
    await vi.runAllTimersAsync()
    expect((await pending).status).toBe('late')
  })

  it('同一天重複打上班卡會丟出錯誤', async () => {
    const service = await loadServiceAt('2024-03-06T08:50:00')
    const first = service.clockIn(1)
    await vi.runAllTimersAsync()
    await first

    const second = service.clockIn(1)
    const assertion = expect(second).rejects.toThrow('今天已經打過上班卡了')
    await vi.runAllTimersAsync()
    await assertion
  })

  it('18:00 前打下班卡為早退，之後維持原狀態', async () => {
    const service = await loadServiceAt('2024-03-06T08:50:00')
    const clockIn = service.clockIn(1)
    await vi.runAllTimersAsync()
    await clockIn

    vi.setSystemTime(new Date('2024-03-06T17:00:00'))
    const early = service.clockOut(1)
    await vi.runAllTimersAsync()
    expect((await early).status).toBe('early_leave')

    const today = service.fetchTodayRecord(1)
    await vi.runAllTimersAsync()
    expect((await today)?.clockOut).toBe('17:00')
  })

  it('沒打上班卡就打下班卡會丟出錯誤', async () => {
    const service = await loadServiceAt('2024-03-06T17:00:00')
    const pending = service.clockOut(1)
    const assertion = expect(pending).rejects.toThrow('請先打上班卡')
    await vi.runAllTimersAsync()
    await assertion
  })

  it('fetchAttendanceRecords 依月份與使用者篩選並由新到舊排序', async () => {
    const service = await loadServiceAt('2024-03-06T08:50:00')
    const pending = service.fetchAttendanceRecords({ month: '2024-02', userId: 1 })
    await vi.runAllTimersAsync()
    const records = await pending

    expect(records.length).toBeGreaterThan(0)
    expect(records.every((record) => record.userId === 1 && record.date.startsWith('2024-02'))).toBe(true)
    const dates = records.map((record) => record.date)
    expect(dates).toEqual([...dates].sort().reverse())
  })
})
