import type { LeaveDecision, LeaveFormPayload, LeaveQuery, LeaveRequest } from '@/types/leave'
import { toDateKey } from '@/utils/date'
import { leaveDb, nextLeaveId } from './mock/leave'
import { findMockUser } from './mock/users'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 依使用者、企業、狀態篩選請假申請，申請日由新到舊 */
export async function fetchLeaveRequests(query: LeaveQuery = {}): Promise<LeaveRequest[]> {
  await delay(450)

  return leaveDb
    .filter(
      (item) =>
        (query.userId === undefined || item.userId === query.userId) &&
        (query.enterpriseName === undefined || item.enterpriseName === query.enterpriseName) &&
        (query.status === undefined || item.status === query.status),
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : b.id - a.id))
    .map((item) => ({ ...item }))
}

/** 學員送出新申請，狀態一律從待審核開始 */
export async function createLeaveRequest(userId: number, payload: LeaveFormPayload): Promise<LeaveRequest> {
  await delay(600)

  const user = findMockUser(userId)
  if (!user) throw new Error('找不到使用者')
  if (payload.endDate < payload.startDate) throw new Error('結束日期不可早於開始日期')

  const request: LeaveRequest = {
    id: nextLeaveId(),
    userId,
    userName: user.name,
    enterpriseName: user.enterpriseName,
    type: payload.type,
    startDate: payload.startDate,
    endDate: payload.endDate,
    reason: payload.reason.trim(),
    status: 'pending',
    createdAt: toDateKey(new Date()),
    reviewedAt: null,
    reviewComment: null,
  }

  leaveDb.push(request)
  return { ...request }
}

/** 管理員審核：只有待審核的申請可以核准或駁回 */
export async function reviewLeaveRequest(id: number, decision: LeaveDecision, comment: string): Promise<LeaveRequest> {
  await delay(600)

  const request = leaveDb.find((item) => item.id === id)
  if (!request) throw new Error('找不到這筆申請')
  if (request.status !== 'pending') throw new Error('這筆申請已經審核過了')

  request.status = decision
  request.reviewedAt = toDateKey(new Date())
  request.reviewComment = comment.trim() || null

  return { ...request }
}
