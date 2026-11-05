<script setup lang="ts">
import StatusBadge from '@/components/StatusBadge.vue'
import { LEAVE_STATUS_LABELS, LEAVE_TYPE_LABELS, type LeaveRequest } from '@/types/leave'
import { formatDateLabel } from '@/utils/date'
import { leaveDays, leaveStatusTone } from './leaveStatus'

/**
 * 請假列表。actions 是 scoped slot，父層可以依角色決定每列要放什麼按鈕。
 */
withDefaults(
  defineProps<{
    requests: LeaveRequest[]
    showUser?: boolean
  }>(),
  { showUser: false },
)

defineSlots<{
  actions?: (props: { request: LeaveRequest }) => unknown
}>()
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">申請日</th>
          <th v-if="showUser" scope="col">申請人</th>
          <th scope="col">假別</th>
          <th scope="col">期間</th>
          <th scope="col">事由</th>
          <th scope="col">狀態</th>
          <th v-if="$slots.actions" scope="col" class="table__actions-head">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in requests" :key="request.id">
          <td class="table__nowrap">{{ formatDateLabel(request.createdAt) }}</td>
          <td v-if="showUser" class="table__nowrap">
            {{ request.userName }}
            <span v-if="request.enterpriseName" class="table__muted">{{ request.enterpriseName }}</span>
          </td>
          <td class="table__nowrap">{{ LEAVE_TYPE_LABELS[request.type] }}</td>
          <td class="table__nowrap">
            {{ formatDateLabel(request.startDate) }}
            <template v-if="request.endDate !== request.startDate"> ～ {{ formatDateLabel(request.endDate) }}</template>
            <span class="table__muted">{{ leaveDays(request.startDate, request.endDate) }} 天</span>
          </td>
          <td class="table__reason">
            {{ request.reason }}
            <span v-if="request.reviewComment" class="table__comment">審核意見：{{ request.reviewComment }}</span>
          </td>
          <td class="table__nowrap">
            <StatusBadge :tone="leaveStatusTone(request.status)">{{ LEAVE_STATUS_LABELS[request.status] }}</StatusBadge>
          </td>
          <td v-if="$slots.actions" class="table__nowrap">
            <slot name="actions" :request="request" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th,
.table td {
  padding: 12px 16px;
  text-align: left;
  vertical-align: top;
}

.table thead th {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.table tbody tr + tr td {
  border-top: 1px solid var(--color-border);
}

.table__nowrap {
  white-space: nowrap;
}

.table__reason {
  min-width: 220px;
}

.table__muted,
.table__comment {
  display: block;
  font-size: 12px;
  color: var(--color-text-muted);
}

.table__comment {
  margin-top: 4px;
}

.table__actions-head {
  width: 1%;
}
</style>
