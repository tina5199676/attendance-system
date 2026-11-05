import type { BadgeTone } from '@/components/StatusBadge.vue'
import type { AttendanceStatus } from '@/types/attendance'

/** 出勤狀態對應到 StatusBadge 的顏色語意，集中一處避免各頁面各寫一套 */
export function attendanceStatusTone(status: AttendanceStatus): BadgeTone {
  switch (status) {
    case 'normal':
      return 'success'
    case 'late':
    case 'early_leave':
      return 'warning'
    case 'absent':
      return 'danger'
    case 'leave':
      return 'info'
  }
}
