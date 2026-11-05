<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import PageHeader from '@/components/PageHeader.vue'
import SegmentedControl, { type SegmentedOption } from '@/components/SegmentedControl.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import LeaveCalendar from '@/components/leave/LeaveCalendar.vue'
import LeaveForm from '@/components/leave/LeaveForm.vue'
import LeaveReviewForm from '@/components/leave/LeaveReviewForm.vue'
import LeaveTable from '@/components/leave/LeaveTable.vue'
import { leaveDays, leaveStatusTone } from '@/components/leave/leaveStatus'
import { fetchLeaveRequests } from '@/services/leaveService'
import { fetchUsers } from '@/services/userService'
import { useAuthStore } from '@/stores/auth'
import { useLeaveStore } from '@/stores/leave'
import { useToastStore } from '@/stores/toast'
import {
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_LABELS,
  type LeaveDecision,
  type LeaveFormPayload,
  type LeaveQuery,
  type LeaveRequest,
  type LeaveStatus,
} from '@/types/leave'
import { addMonths, formatDateLabel, formatMonthLabel, toMonthKey } from '@/utils/date'
import { buildLeaveCalendar, summarizeCalendar, type CalendarDay } from '@/utils/leaveCalendar'

const auth = useAuthStore()
const leave = useLeaveStore()
const toast = useToastStore()

const isStudent = computed(() => auth.role === 'student')
const isAdmin = computed(() => auth.role === 'admin')

/** 資料範圍：學員只看自己，企業看所屬學員，管理員看全部 */
const scope = computed<Omit<LeaveQuery, 'status'>>(() => ({
  userId: isStudent.value ? auth.user?.id : undefined,
  enterpriseName: auth.role === 'enterprise' ? (auth.user?.enterpriseName ?? undefined) : undefined,
}))

// ---- 檢視切換 ----
const view = ref('list')
const viewOptions: SegmentedOption[] = [
  { value: 'list', label: '列表' },
  { value: 'calendar', label: '日曆' },
]

// ---- 列表：狀態篩選（頁籤）----
type StatusFilter = LeaveStatus | 'all'
const statusFilter = ref<StatusFilter>('all')
const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: LEAVE_STATUS_LABELS.pending },
  { value: 'approved', label: LEAVE_STATUS_LABELS.approved },
  { value: 'rejected', label: LEAVE_STATUS_LABELS.rejected },
]

const query = computed<LeaveQuery>(() => ({
  ...scope.value,
  status: statusFilter.value === 'all' ? undefined : statusFilter.value,
}))

function loadRequests(): Promise<void> {
  return leave.loadRequests(query.value)
}

watch(query, loadRequests, { immediate: true })

// ---- 日曆：另外載入「不分狀態」的申請，切到日曆時才第一次載入 ----
const calendarMonth = ref(toMonthKey(new Date()))
const calendarRequests = ref<LeaveRequest[]>([])
const calendarLoaded = ref(false)
const calendarLoading = ref(false)
const calendarError = ref('')
const studentCount = ref(0)

async function loadCalendar(): Promise<void> {
  calendarLoading.value = true
  calendarError.value = ''
  try {
    const [requests, students] = await Promise.all([
      fetchLeaveRequests(scope.value),
      isStudent.value
        ? Promise.resolve([])
        : fetchUsers({ role: 'student', enterpriseName: scope.value.enterpriseName, isActive: true }),
    ])
    calendarRequests.value = requests
    studentCount.value = students.length
    calendarLoaded.value = true
  } catch (error) {
    calendarError.value = error instanceof Error ? error.message : '載入日曆資料失敗'
  } finally {
    calendarLoading.value = false
  }
}

watch(view, (value) => {
  if (value === 'calendar' && !calendarLoaded.value) loadCalendar()
})

const calendarDays = computed(() => buildLeaveCalendar(calendarMonth.value, calendarRequests.value))
const calendarSummary = computed(() => summarizeCalendar(calendarDays.value))

const selectedDay = ref<CalendarDay | null>(null)

/** 申請或審核後，列表與日曆都要同步 */
async function refreshAfterChange(): Promise<void> {
  if (calendarLoaded.value) await loadCalendar()
}

const pageDescription = computed(() => {
  if (isStudent.value) return '提出請假申請並追蹤審核進度。'
  if (isAdmin.value) return '審核所有學員的請假申請，日曆檢視可掌握每日人力。'
  return '查看所屬學員的請假申請，日曆檢視可掌握每日人力。'
})

// ---- 學員：申請 ----
const applyOpen = ref(false)

async function handleApply(payload: LeaveFormPayload): Promise<void> {
  if (!auth.user) return
  try {
    await leave.createRequest(auth.user.id, payload)
    applyOpen.value = false
    toast.success('請假申請已送出，請等待審核。')
    await refreshAfterChange()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '送出失敗，請稍後再試')
  }
}

// ---- 管理員：審核 ----
const reviewing = ref<LeaveRequest | null>(null)

function openReview(request: LeaveRequest): void {
  selectedDay.value = null
  reviewing.value = request
}

async function handleDecide(decision: LeaveDecision, comment: string): Promise<void> {
  if (!reviewing.value) return
  try {
    const updated = await leave.reviewRequest(reviewing.value.id, decision, comment)
    reviewing.value = null
    toast.success(`已${LEAVE_STATUS_LABELS[updated.status].replace('已', '')}${updated.userName}的請假申請。`)
    await refreshAfterChange()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '審核失敗，請稍後再試')
  }
}
</script>

<template>
  <div class="leave">
    <PageHeader title="請假管理" :description="pageDescription">
      <template #actions>
        <SegmentedControl v-model="view" :options="viewOptions" label="切換檢視方式" />
        <BaseButton v-if="isStudent" @click="applyOpen = true">申請請假</BaseButton>
      </template>
    </PageHeader>

    <!-- ===== 列表檢視 ===== -->
    <template v-if="view === 'list'">
      <div class="leave__tabs" role="tablist" aria-label="依狀態篩選">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          role="tab"
          class="leave__tab"
          :class="{ 'leave__tab--active': statusFilter === tab.value }"
          :aria-selected="statusFilter === tab.value"
          :disabled="leave.loading"
          @click="statusFilter = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <LoadingState v-if="leave.loading" text="載入請假申請中…" />

      <EmptyState v-else-if="leave.error" title="載入失敗" :description="leave.error">
        <template #actions>
          <BaseButton variant="secondary" @click="loadRequests">重新載入</BaseButton>
        </template>
      </EmptyState>

      <EmptyState
        v-else-if="leave.requests.length === 0"
        title="沒有符合條件的請假申請"
        :description="isStudent ? '目前沒有申請紀錄，點右上角「申請請假」提出第一筆。' : '換一個狀態頁籤看看。'"
      />

      <LeaveTable v-else :requests="leave.requests" :show-user="!isStudent">
        <template v-if="isAdmin" #actions="{ request }">
          <BaseButton v-if="request.status === 'pending'" variant="secondary" @click="openReview(request)">
            審核
          </BaseButton>
        </template>
      </LeaveTable>
    </template>

    <!-- ===== 日曆檢視 ===== -->
    <template v-else>
      <div class="leave__calendar-bar">
        <div class="leave__month-nav">
          <BaseButton variant="secondary" aria-label="上個月" @click="calendarMonth = addMonths(calendarMonth, -1)">‹</BaseButton>
          <span class="leave__month-label">{{ formatMonthLabel(calendarMonth) }}</span>
          <BaseButton variant="secondary" aria-label="下個月" @click="calendarMonth = addMonths(calendarMonth, 1)">›</BaseButton>
          <BaseButton variant="ghost" @click="calendarMonth = toMonthKey(new Date())">本月</BaseButton>
        </div>

        <p v-if="calendarLoaded" class="leave__summary">
          <template v-if="isStudent">
            本月核准請假 <strong>{{ calendarSummary.approvedDays }}</strong> 天，待審核 <strong>{{ calendarSummary.pendingRequests }}</strong> 筆。
          </template>
          <template v-else-if="calendarSummary.peakDate">
            本月核准請假共 <strong>{{ calendarSummary.approvedDays }}</strong> 人日，
            最高同日 <strong>{{ calendarSummary.peakCount }} / {{ studentCount }}</strong> 人請假（{{ formatDateLabel(calendarSummary.peakDate) }}），
            待審核 <strong>{{ calendarSummary.pendingRequests }}</strong> 筆。
          </template>
          <template v-else>本月沒有核准的請假，待審核 <strong>{{ calendarSummary.pendingRequests }}</strong> 筆。</template>
        </p>
      </div>

      <LoadingState v-if="calendarLoading && !calendarLoaded" text="載入日曆中…" />

      <EmptyState v-else-if="calendarError" title="載入失敗" :description="calendarError">
        <template #actions>
          <BaseButton variant="secondary" @click="loadCalendar">重新載入</BaseButton>
        </template>
      </EmptyState>

      <div v-else class="leave__calendar" :class="{ 'is-refreshing': calendarLoading }">
        <LeaveCalendar
          :month-key="calendarMonth"
          :requests="calendarRequests"
          :show-user="!isStudent"
          @select-day="selectedDay = $event"
        />
      </div>
    </template>

    <!-- 當日名單 -->
    <BaseModal :open="selectedDay !== null" :title="selectedDay ? `${formatDateLabel(selectedDay.key)} 請假名單` : ''" @close="selectedDay = null">
      <ul v-if="selectedDay" class="leave__day-list">
        <li v-for="request in selectedDay.requests" :key="request.id" class="leave__day-item">
          <div class="leave__day-main">
            <p class="leave__day-title">
              <template v-if="!isStudent">{{ request.userName }}・</template>{{ LEAVE_TYPE_LABELS[request.type] }}
            </p>
            <p class="leave__day-meta">
              {{ formatDateLabel(request.startDate) }}
              <template v-if="request.endDate !== request.startDate"> ～ {{ formatDateLabel(request.endDate) }}</template>
              ・{{ leaveDays(request.startDate, request.endDate) }} 天・{{ request.reason }}
            </p>
          </div>
          <StatusBadge :tone="leaveStatusTone(request.status)">{{ LEAVE_STATUS_LABELS[request.status] }}</StatusBadge>
          <BaseButton v-if="isAdmin && request.status === 'pending'" variant="secondary" @click="openReview(request)">審核</BaseButton>
        </li>
      </ul>
    </BaseModal>

    <BaseModal :open="applyOpen" title="申請請假" @close="applyOpen = false">
      <LeaveForm v-if="applyOpen" :submitting="leave.submitting" @submit="handleApply" @cancel="applyOpen = false" />
    </BaseModal>

    <BaseModal :open="reviewing !== null" title="審核請假申請" @close="reviewing = null">
      <LeaveReviewForm
        v-if="reviewing"
        :request="reviewing"
        :submitting="leave.submitting"
        @decide="handleDecide"
        @cancel="reviewing = null"
      />
    </BaseModal>
  </div>
</template>

<style scoped>
.leave__tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  width: fit-content;
}

.leave__tab {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.leave__tab:hover:not(:disabled) {
  color: var(--color-text);
}

.leave__tab--active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 600;
}

.leave__tab:disabled {
  cursor: not-allowed;
}

.leave__calendar-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.leave__month-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.leave__month-label {
  min-width: 120px;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
}

.leave__summary {
  font-size: 13px;
  color: var(--color-text-muted);
}

.leave__summary strong {
  color: var(--color-text);
}

.leave__calendar {
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  transition: opacity 0.2s ease;
}

.leave__calendar.is-refreshing {
  opacity: 0.5;
  pointer-events: none;
}

.leave__day-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.leave__day-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.leave__day-main {
  flex: 1;
  min-width: 0;
}

.leave__day-title {
  font-size: 14px;
  font-weight: 600;
}

.leave__day-meta {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
