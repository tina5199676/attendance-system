import type { BadgeTone } from '@/components/StatusBadge.vue'
import type { UserRole } from '@/types/user'

export function roleTone(role: UserRole): BadgeTone {
  switch (role) {
    case 'student':
      return 'info'
    case 'enterprise':
      return 'success'
    case 'admin':
      return 'warning'
  }
}
