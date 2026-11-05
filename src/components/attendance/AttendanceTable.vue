<script setup lang="ts">
import StatusBadge from '@/components/StatusBadge.vue'
import { ATTENDANCE_STATUS_LABELS, type AttendanceRecord } from '@/types/attendance'
import { formatDateLabel } from '@/utils/date'
import { attendanceStatusTone } from './attendanceStatus'

/**
 * 出勤紀錄表格：只負責把資料排成表格，
 * Loading / Error / Empty 由父層決定要不要渲染這個元件。
 */
withDefaults(
  defineProps<{
    records: AttendanceRecord[]
    /** 企業與管理員檢視時顯示學員欄位 */
    showUser?: boolean
  }>(),
  { showUser: false },
)
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">日期</th>
          <th v-if="showUser" scope="col">學員</th>
          <th scope="col">上班</th>
          <th scope="col">下班</th>
          <th scope="col">狀態</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in records" :key="record.id">
          <td class="table__date">{{ formatDateLabel(record.date) }}</td>
          <td v-if="showUser">{{ record.userName }}</td>
          <td class="table__time">{{ record.clockIn ?? '—' }}</td>
          <td class="table__time">{{ record.clockOut ?? '—' }}</td>
          <td>
            <StatusBadge :tone="attendanceStatusTone(record.status)">
              {{ ATTENDANCE_STATUS_LABELS[record.status] }}
            </StatusBadge>
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
  white-space: nowrap;
}

.table thead th {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.table tbody tr + tr td {
  border-top: 1px solid var(--color-border);
}

.table tbody tr:hover td {
  background: #fafbfd;
}

.table__date {
  font-weight: 600;
}

.table__time {
  font-variant-numeric: tabular-nums;
}
</style>
