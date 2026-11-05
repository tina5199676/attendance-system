import { describe, expect, it } from 'vitest'
import type { AttendanceRecord, AttendanceStatus } from '@/types/attendance'
import { anomaliesByUser, niceTicks, summarize } from './attendanceStats'

let nextId = 1

function record(userId: number, status: AttendanceStatus, userName = `user-${userId}`): AttendanceRecord {
  const id = nextId
  nextId += 1
  return { id, userId, userName, date: '2024-03-01', clockIn: null, clockOut: null, status }
}

describe('summarize', () => {
  it('計算各狀態數量、實際出勤、應出勤與出勤率', () => {
    const summary = summarize([
      record(1, 'normal'),
      record(1, 'normal'),
      record(1, 'late'),
      record(1, 'leave'),
      record(1, 'absent'),
    ])

    expect(summary.total).toBe(5)
    expect(summary.normal).toBe(2)
    expect(summary.late).toBe(1)
    expect(summary.leave).toBe(1)
    expect(summary.absent).toBe(1)
    // 實際出勤 = 正常 + 遲到 + 早退 = 3；應出勤 = 全部 − 請假 = 4
    expect(summary.present).toBe(3)
    expect(summary.expected).toBe(4)
    expect(summary.rate).toBe(75)
  })

  it('沒有應出勤天數時出勤率為 null', () => {
    expect(summarize([]).rate).toBeNull()
    expect(summarize([record(1, 'leave')]).rate).toBeNull()
  })

  it('出勤率四捨五入到小數一位', () => {
    const summary = summarize([record(1, 'normal'), record(1, 'normal'), record(1, 'absent')])
    expect(summary.rate).toBe(66.7)
  })
})

describe('anomaliesByUser', () => {
  it('依異常次數由多到少排序，並保留細項', () => {
    const result = anomaliesByUser([
      record(1, 'normal', '甲'),
      record(1, 'late', '甲'),
      record(2, 'absent', '乙'),
      record(2, 'early_leave', '乙'),
      record(2, 'late', '乙'),
      record(3, 'normal', '丙'),
    ])

    expect(result.map((entry) => entry.userName)).toEqual(['乙', '甲', '丙'])
    expect(result[0]).toMatchObject({ late: 1, earlyLeave: 1, absent: 1, total: 3 })
    expect(result[2]).toMatchObject({ total: 0 })
  })
})

describe('niceTicks', () => {
  it('產生從 0 開始、涵蓋最大值的整齊刻度', () => {
    expect(niceTicks(37)).toEqual([0, 10, 20, 30, 40])
    expect(niceTicks(7)).toEqual([0, 2, 4, 6, 8])
  })

  it('最大值為 0 時仍有刻度', () => {
    expect(niceTicks(0)).toEqual([0, 1])
  })
})
