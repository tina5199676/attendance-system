import { describe, expect, it } from 'vitest'
import type { LeaveRequest, LeaveStatus } from '@/types/leave'
import { buildLeaveCalendar, summarizeCalendar } from './leaveCalendar'

function request(id: number, userName: string, startDate: string, endDate: string, status: LeaveStatus): LeaveRequest {
  return {
    id,
    userId: id,
    userName,
    enterpriseName: '測試企業',
    type: 'personal',
    startDate,
    endDate,
    reason: '測試',
    status,
    createdAt: startDate,
    reviewedAt: null,
    reviewComment: null,
  }
}

const requests = [
  request(1, '甲', '2024-02-28', '2024-03-01', 'approved'),
  request(2, '乙', '2024-02-29', '2024-02-29', 'pending'),
  request(3, '丙', '2024-02-29', '2024-02-29', 'rejected'),
]

describe('buildLeaveCalendar', () => {
  it('把跨日申請展開到每一天，並排除已駁回', () => {
    const days = buildLeaveCalendar('2024-02', requests)
    const byKey = Object.fromEntries(days.map((day) => [day.key, day]))

    expect(byKey['2024-02-28']?.requests.map((item) => item.userName)).toEqual(['甲'])
    expect(byKey['2024-02-29']?.requests.map((item) => item.userName)).toEqual(['甲', '乙'])
    expect(byKey['2024-02-29']).toMatchObject({ approvedCount: 1, pendingCount: 1 })
    expect(byKey['2024-02-27']?.requests).toHaveLength(0)
  })

  it('標記不在本月的補位日期', () => {
    const days = buildLeaveCalendar('2024-02', requests)
    const march1 = days.find((day) => day.key === '2024-03-01')
    expect(march1?.inMonth).toBe(false)
    expect(march1?.requests).toHaveLength(1)
  })
})

describe('summarizeCalendar', () => {
  it('只統計本月的核准人日並找出高峰日', () => {
    const summary = summarizeCalendar(buildLeaveCalendar('2024-02', requests))
    // 甲在 2/28、2/29 各一人日；3/1 不屬於本月
    expect(summary.approvedDays).toBe(2)
    expect(summary.peakCount).toBe(1)
    expect(summary.peakDate).toBe('2024-02-28')
    expect(summary.pendingRequests).toBe(1)
  })

  it('沒有核准時 peakDate 為 null', () => {
    const summary = summarizeCalendar(buildLeaveCalendar('2024-02', [requests[1] as LeaveRequest]))
    expect(summary.peakCount).toBe(0)
    expect(summary.peakDate).toBeNull()
  })
})
