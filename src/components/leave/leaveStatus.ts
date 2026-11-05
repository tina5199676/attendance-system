import type { BadgeTone } from '@/components/StatusBadge.vue'
import type { LeaveStatus } from '@/types/leave'
import { parseDateKey } from '@/utils/date'

export function leaveStatusTone(status: LeaveStatus): BadgeTone {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
  }
}

/** 含起訖日的請假天數 */
export function leaveDays(startDate: string, endDate: string): number {
  const start = parseDateKey(startDate).getTime()
  const end = parseDateKey(endDate).getTime()
  return Math.max(0, Math.round((end - start) / 86_400_000)) + 1
}
