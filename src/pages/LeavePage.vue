<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import PageHeader from '@/components/PageHeader.vue'
import LeaveForm from '@/components/leave/LeaveForm.vue'
import LeaveReviewForm from '@/components/leave/LeaveReviewForm.vue'
import LeaveTable from '@/components/leave/LeaveTable.vue'
import { useAuthStore } from '@/stores/auth'
import { useLeaveStore } from '@/stores/leave'
import { useToastStore } from '@/stores/toast'
import {
  LEAVE_STATUS_LABELS,
  type LeaveDecision,
  type LeaveFormPayload,
  type LeaveQuery,
  type LeaveRequest,
  type LeaveStatus,
} from '@/types/leave'

const auth = useAuthStore()
const leave = useLeaveStore()
const toast = useToastStore()

const isStudent = computed(() => auth.role === 'student')
const isAdmin = computed(() => auth.role === 'admin')

// ---- 狀態篩選（頁籤）----
type StatusFilter = LeaveStatus | 'all'
const statusFilter = ref<StatusFilter>('all')
const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: LEAVE_STATUS_LABELS.pending },
  { value: 'approved', label: LEAVE_STATUS_LABELS.approved },
  { value: 'rejected', label: LEAVE_STATUS_LABELS.rejected },
]

const query = computed<LeaveQuery>(() => ({
  userId: isStudent.value ? auth.user?.id : undefined,
  enterpriseName: auth.role === 'enterprise' ? (auth.user?.enterpriseName ?? undefined) : undefined,
  status: statusFilter.value === 'all' ? undefined : statusFilter.value,
}))

function loadRequests(): Promise<void> {
  return leave.loadRequests(query.value)
}

watch(query, loadRequests, { immediate: true })

const pageDescription = computed(() => {
  if (isStudent.value) return '提出請假申請並追蹤審核進度。'
  if (isAdmin.value) return '審核所有學員的請假申請。'
  return '查看所屬學員的請假申請與審核結果。'
})

// ---- 學員：申請 ----
const applyOpen = ref(false)

async function handleApply(payload: LeaveFormPayload): Promise<void> {
  if (!auth.user) return
  try {
    await leave.createRequest(auth.user.id, payload)
    applyOpen.value = false
    toast.success('請假申請已送出，請等待審核。')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '送出失敗，請稍後再試')
  }
}

// ---- 管理員：審核 ----
const reviewing = ref<LeaveRequest | null>(null)

async function handleDecide(decision: LeaveDecision, comment: string): Promise<void> {
  if (!reviewing.value) return
  try {
    const updated = await leave.reviewRequest(reviewing.value.id, decision, comment)
    reviewing.value = null
    toast.success(`已${LEAVE_STATUS_LABELS[updated.status].replace('已', '')}${updated.userName}的請假申請。`)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '審核失敗，請稍後再試')
  }
}
</script>

<template>
  <div class="leave">
    <PageHeader title="請假管理" :description="pageDescription">
      <template v-if="isStudent" #actions>
        <BaseButton @click="applyOpen = true">申請請假</BaseButton>
      </template>
    </PageHeader>

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
        <BaseButton
          v-if="request.status === 'pending'"
          variant="secondary"
          @click="reviewing = request"
        >
          審核
        </BaseButton>
      </template>
    </LeaveTable>

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
</style>
