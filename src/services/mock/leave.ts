import type { LeaveRequest, LeaveStatus, LeaveType } from '@/types/leave'
import { toDateKey } from '@/utils/date'
import { findMockUser } from './users'

/** 相對於今天的日期，offset 為負代表過去 */
function day(offset: number): string {
  const today = new Date()
  return toDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset))
}

interface Seed {
  userId: number
  type: LeaveType
  start: number
  end: number
  reason: string
  status: LeaveStatus
  createdAt: number
  comment?: string
}

const SEEDS: Seed[] = [
  { userId: 1, type: 'sick', start: -20, end: -20, reason: '感冒發燒，需在家休養。', status: 'approved', createdAt: -21, comment: '請好好休息。' },
  { userId: 1, type: 'personal', start: -9, end: -9, reason: '處理銀行開戶事宜。', status: 'approved', createdAt: -12 },
  { userId: 1, type: 'annual', start: 6, end: 7, reason: '家庭旅遊。', status: 'pending', createdAt: -1 },
  { userId: 4, type: 'official', start: -15, end: -15, reason: '參加校內實習成果發表。', status: 'approved', createdAt: -18, comment: '祝發表順利。' },
  { userId: 4, type: 'personal', start: 3, end: 3, reason: '陪同家人就醫。', status: 'pending', createdAt: 0 },
  { userId: 5, type: 'sick', start: -30, end: -29, reason: '腸胃炎就醫。', status: 'approved', createdAt: -30 },
  { userId: 5, type: 'annual', start: -5, end: -3, reason: '返鄉探親。', status: 'rejected', createdAt: -14, comment: '該週為專案驗收週，請改期申請。' },
  { userId: 5, type: 'personal', start: 10, end: 10, reason: '駕照考試。', status: 'pending', createdAt: -2 },
  { userId: 6, type: 'annual', start: -40, end: -38, reason: '出國旅遊。', status: 'approved', createdAt: -50, comment: '已核准，旅途愉快。' },
  { userId: 6, type: 'sick', start: 1, end: 1, reason: '牙科手術。', status: 'pending', createdAt: -3 },
  { userId: 7, type: 'personal', start: -25, end: -25, reason: '搬家。', status: 'rejected', createdAt: -26, comment: '申請時間過於緊迫，請提前三天提出。' },
  { userId: 7, type: 'official', start: 14, end: 14, reason: '代表企業參加技術研討會。', status: 'pending', createdAt: -1 },
]

function buildRequest(id: number, seed: Seed): LeaveRequest {
  const user = findMockUser(seed.userId)
  const reviewed = seed.status !== 'pending'
  return {
    id,
    userId: seed.userId,
    userName: user?.name ?? '未知使用者',
    enterpriseName: user?.enterpriseName ?? null,
    type: seed.type,
    startDate: day(seed.start),
    endDate: day(seed.end),
    reason: seed.reason,
    status: seed.status,
    createdAt: day(seed.createdAt),
    reviewedAt: reviewed ? day(seed.createdAt + 1) : null,
    reviewComment: reviewed ? (seed.comment ?? null) : null,
  }
}

/** 模組層級的「資料庫」：申請與審核會直接修改此陣列，重新整理後重置 */
export const leaveDb: LeaveRequest[] = SEEDS.map((seed, index) => buildRequest(index + 1, seed))

export function nextLeaveId(): number {
  return leaveDb.reduce((max, item) => Math.max(max, item.id), 0) + 1
}
