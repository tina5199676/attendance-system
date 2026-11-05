<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import StatusBadge, { type BadgeTone } from '@/components/StatusBadge.vue'
import LeaveTable from '@/components/leave/LeaveTable.vue'
import { attendanceStatusTone } from '@/components/attendance/attendanceStatus'
import { fetchAttendanceRecords, fetchTodayRecord } from '@/services/attendanceService'
import { fetchLeaveRequests } from '@/services/leaveService'
import { fetchUsers } from '@/services/userService'
import { useAuthStore } from '@/stores/auth'
import { ATTENDANCE_STATUS_LABELS, type AttendanceRecord } from '@/types/attendance'
import type { LeaveRequest } from '@/types/leave'
import { ROLE_LABELS, type User } from '@/types/user'
import { formatMonthLabel, toMonthKey } from '@/utils/date'

/**
 * 總覽頁：依角色組合不同的摘要資訊。
 * 這頁沒有自己的 store，直接呼叫 services 並用 Promise.all 平行載入，
 * 因為資料只在這一頁用到，放進全域 store 反而增加複雜度。
 */
const auth = useAuthStore()

const loading = ref(true)
const error = ref('')

const month = toMonthKey(new Date())
const monthLabel = formatMonthLabel(month)

const records = ref<AttendanceRecord[]>([])
const todayRecord = ref<AttendanceRecord | null>(null)
const leaveRequests = ref<LeaveRequest[]>([])
const users = ref<User[]>([])

const greeting = computed(() => (auth.user ? `${auth.user.name}，歡迎回來` : ''))
const description = computed(() => {
  if (!auth.role) return ''
  const label = ROLE_LABELS[auth.role]
  return auth.user?.enterpriseName ? `${label}・${auth.user.enterpriseName}` : label
})

const countBy = (status: AttendanceRecord['status']) => records.value.filter((r) => r.status === status).length
const pendingLeaves = computed(() => leaveRequests.value.filter((r) => r.status === 'pending'))
const recentLeaves = computed(() => leaveRequests.value.slice(0, 5))

interface StatItem {
  label: string
  value: string | number
  hint: string
  tone: BadgeTone
}

/** 依角色產生統計卡片內容 */
const stats = computed<StatItem[]>(() => {
  const late = countBy('late') + countBy('early_leave')
  const absent = countBy('absent')
  const pending = pendingLeaves.value.length

  const lateCard: StatItem = { label: '遲到與早退', value: late, hint: monthLabel, tone: late > 0 ? 'warning' : 'neutral' }
  const absentCard: StatItem = { label: '缺勤', value: absent, hint: monthLabel, tone: absent > 0 ? 'danger' : 'neutral' }

  if (auth.role === 'student') {
    return [
      { label: `${monthLabel}出勤`, value: `${countBy('normal')} / ${records.value.length}`, hint: '正常 / 應出勤天數', tone: 'success' },
      lateCard,
      absentCard,
      { label: '待審核請假', value: pending, hint: '等待管理員審核', tone: 'info' },
    ]
  }

  const activeUsers = users.value.filter((u) => u.isActive)
  const students = activeUsers.filter((u) => u.role === 'student')
  const isAdmin = auth.role === 'admin'

  return [
    isAdmin
      ? { label: '啟用中使用者', value: activeUsers.length, hint: `其中學員 ${students.length} 位`, tone: 'info' }
      : { label: '所屬學員', value: students.length, hint: '啟用中的帳號', tone: 'info' },
    { ...lateCard, hint: `${monthLabel}・全部學員` },
    { ...absentCard, hint: `${monthLabel}・全部學員` },
    { label: '待審核請假', value: pending, hint: isAdmin ? '需要你審核' : '等待管理員審核', tone: pending > 0 ? 'warning' : 'neutral' },
  ]
})

async function load(): Promise<void> {
  if (!auth.user) return
  loading.value = true
  error.value = ''

  const enterpriseName = auth.role === 'enterprise' ? (auth.user.enterpriseName ?? undefined) : undefined

  try {
    if (auth.role === 'student') {
      const [monthRecords, today, leaves] = await Promise.all([
        fetchAttendanceRecords({ month, userId: auth.user.id }),
        fetchTodayRecord(auth.user.id),
        fetchLeaveRequests({ userId: auth.user.id }),
      ])
      records.value = monthRecords
      todayRecord.value = today
      leaveRequests.value = leaves
    } else {
      const [monthRecords, leaves, allUsers] = await Promise.all([
        fetchAttendanceRecords({ month, enterpriseName }),
        fetchLeaveRequests({ enterpriseName }),
        fetchUsers({ enterpriseName }),
      ])
      records.value = monthRecords
      leaveRequests.value = leaves
      users.value = allUsers
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '載入總覽資料失敗'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="dashboard">
    <PageHeader :title="greeting" :description="description" />

    <LoadingState v-if="loading" text="載入總覽中…" />

    <EmptyState v-else-if="error" title="載入失敗" :description="error">
      <template #actions>
        <BaseButton variant="secondary" @click="load">重新載入</BaseButton>
      </template>
    </EmptyState>

    <template v-else>
      <!-- 學員：今日打卡狀態 -->
      <section v-if="auth.role === 'student'" class="dashboard__today">
        <div>
          <p class="dashboard__today-label">今日狀態</p>
          <div class="dashboard__today-status">
            <StatusBadge v-if="todayRecord" :tone="attendanceStatusTone(todayRecord.status)">
              {{ ATTENDANCE_STATUS_LABELS[todayRecord.status] }}
            </StatusBadge>
            <StatusBadge v-else tone="neutral">尚未打卡</StatusBadge>
            <span v-if="todayRecord" class="dashboard__today-time">
              上班 {{ todayRecord.clockIn ?? '--:--' }}・下班 {{ todayRecord.clockOut ?? '--:--' }}
            </span>
          </div>
        </div>
        <div class="dashboard__today-actions">
          <RouterLink :to="{ name: 'attendance' }">
            <BaseButton>前往打卡</BaseButton>
          </RouterLink>
          <RouterLink :to="{ name: 'leave' }">
            <BaseButton variant="secondary">申請請假</BaseButton>
          </RouterLink>
        </div>
      </section>

      <div class="dashboard__stats">
        <StatCard v-for="item in stats" :key="item.label" v-bind="item" />
      </div>

      <section class="dashboard__section">
        <div class="dashboard__section-head">
          <h2 class="dashboard__section-title">
            {{ auth.role === 'admin' ? '待審核的請假申請' : '最近的請假申請' }}
          </h2>
          <RouterLink :to="{ name: 'leave' }" class="dashboard__link">查看全部</RouterLink>
        </div>

        <EmptyState
          v-if="(auth.role === 'admin' ? pendingLeaves : recentLeaves).length === 0"
          :title="auth.role === 'admin' ? '目前沒有待審核的申請' : '還沒有請假申請'"
        />
        <LeaveTable
          v-else
          :requests="auth.role === 'admin' ? pendingLeaves : recentLeaves"
          :show-user="auth.role !== 'student'"
        />
      </section>
    </template>
  </div>
</template>

<style scoped>
.dashboard__today {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  padding: 18px 22px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.dashboard__today-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.dashboard__today-status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.dashboard__today-time {
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.dashboard__today-actions {
  display: flex;
  gap: 8px;
}

.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 28px;
}

.dashboard__section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.dashboard__section-title {
  font-size: 17px;
  font-weight: 700;
}

.dashboard__link {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
}

.dashboard__link:hover {
  text-decoration: underline;
}
</style>
