<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseSelect, { type SelectOption } from '@/components/BaseSelect.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import PageHeader from '@/components/PageHeader.vue'
import AttendanceTable from '@/components/attendance/AttendanceTable.vue'
import ClockCard from '@/components/attendance/ClockCard.vue'
import { fetchUsers } from '@/services/userService'
import { useAttendanceStore } from '@/stores/attendance'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { ATTENDANCE_STATUS_LABELS, type AttendanceQuery, type AttendanceStatus } from '@/types/attendance'
import type { User } from '@/types/user'
import { formatMonthLabel, recentMonthKeys, toMonthKey } from '@/utils/date'

const auth = useAuthStore()
const attendance = useAttendanceStore()
const toast = useToastStore()

const isStudent = computed(() => auth.role === 'student')

// ---- 篩選條件 ----
const month = ref(toMonthKey(new Date()))
const monthOptions: SelectOption[] = recentMonthKeys(4).map((key) => ({
  value: key,
  label: formatMonthLabel(key),
}))

/** 0 代表「全部學員」 */
const selectedUserId = ref<number>(0)
const students = ref<User[]>([])
const studentOptions = computed<SelectOption[]>(() => [
  { value: 0, label: '全部學員' },
  ...students.value.map((student) => ({ value: student.id, label: student.name })),
])

/** 依角色組出查詢條件：學員只看自己，企業只看所屬學員，管理員看全部 */
const query = computed<AttendanceQuery>(() => {
  if (isStudent.value) {
    return { month: month.value, userId: auth.user?.id }
  }
  return {
    month: month.value,
    userId: selectedUserId.value || undefined,
    enterpriseName: auth.role === 'enterprise' ? (auth.user?.enterpriseName ?? undefined) : undefined,
  }
})

// ---- 摘要 ----
const SUMMARY_ORDER: AttendanceStatus[] = ['normal', 'late', 'early_leave', 'leave', 'absent']
const summaryItems = computed(() =>
  SUMMARY_ORDER.map((status) => ({
    status,
    label: ATTENDANCE_STATUS_LABELS[status],
    count: attendance.summary[status],
  })),
)

// ---- 打卡 ----
const clockError = ref('')

async function handleClock(action: 'in' | 'out'): Promise<void> {
  if (!auth.user) return
  clockError.value = ''
  try {
    if (action === 'in') {
      await attendance.clockIn(auth.user.id)
      toast.success('上班打卡成功，今天也加油！')
    } else {
      await attendance.clockOut(auth.user.id)
      toast.success('下班打卡成功，辛苦了。')
    }
    // 打卡會新增或更新今天的紀錄，重新載入列表讓表格同步
    await attendance.loadRecords(query.value)
  } catch (error) {
    clockError.value = error instanceof Error ? error.message : '打卡失敗，請稍後再試'
  }
}

// ---- 載入 ----
function loadRecords(): Promise<void> {
  return attendance.loadRecords(query.value)
}

onMounted(async () => {
  if (isStudent.value && auth.user) {
    await attendance.loadToday(auth.user.id)
  } else {
    students.value = await fetchUsers({
      role: 'student',
      enterpriseName: auth.role === 'enterprise' ? (auth.user?.enterpriseName ?? undefined) : undefined,
    })
  }
})

// 篩選條件一變就重新查詢；immediate 讓頁面一進來就先載入一次
watch(query, loadRecords, { immediate: true })
</script>

<template>
  <div class="attendance">
    <PageHeader
      title="出勤紀錄"
      :description="isStudent ? '查看每日上下班打卡與出勤狀態。' : '查看所屬學員的出勤狀況。'"
    />

    <ClockCard
      v-if="isStudent"
      class="attendance__clock"
      :record="attendance.todayRecord"
      :clocking="attendance.clocking"
      :error-message="clockError"
      @clock-in="handleClock('in')"
      @clock-out="handleClock('out')"
    />

    <div class="attendance__toolbar">
      <div class="attendance__filters">
        <BaseSelect v-model="month" label="月份" :options="monthOptions" :disabled="attendance.loading" />
        <BaseSelect
          v-if="!isStudent"
          v-model="selectedUserId"
          label="學員"
          :options="studentOptions"
          :disabled="attendance.loading"
        />
      </div>

      <ul class="attendance__summary" aria-label="本月出勤摘要">
        <li v-for="item in summaryItems" :key="item.status" class="attendance__summary-item">
          <span class="attendance__summary-count">{{ item.count }}</span>
          <span class="attendance__summary-label">{{ item.label }}</span>
        </li>
      </ul>
    </div>

    <LoadingState v-if="attendance.loading" text="載入出勤紀錄中…" />

    <EmptyState v-else-if="attendance.error" title="載入失敗" :description="attendance.error">
      <template #actions>
        <BaseButton variant="secondary" @click="loadRecords">重新載入</BaseButton>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="attendance.records.length === 0"
      title="這個月還沒有出勤紀錄"
      description="換一個月份看看，或等待學員打卡後再回來查看。"
    />

    <AttendanceTable v-else :records="attendance.records" :show-user="!isStudent" />
  </div>
</template>

<style scoped>
.attendance__clock {
  margin-bottom: 24px;
}

.attendance__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.attendance__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.attendance__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attendance__summary-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.attendance__summary-count {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.attendance__summary-label {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
