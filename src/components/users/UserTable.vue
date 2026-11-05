<script setup lang="ts">
import StatusBadge from '@/components/StatusBadge.vue'
import { ROLE_LABELS, type User } from '@/types/user'
import { roleTone } from './roleTone'

defineProps<{
  users: User[]
}>()

defineSlots<{
  actions?: (props: { user: User }) => unknown
}>()
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">姓名</th>
          <th scope="col">電子郵件</th>
          <th scope="col">角色</th>
          <th scope="col">所屬企業</th>
          <th scope="col">狀態</th>
          <th v-if="$slots.actions" scope="col" class="table__actions-head">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" :class="{ 'table__row--inactive': !user.isActive }">
          <td class="table__name">{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <StatusBadge :tone="roleTone(user.role)">{{ ROLE_LABELS[user.role] }}</StatusBadge>
          </td>
          <td>{{ user.enterpriseName ?? '—' }}</td>
          <td>
            <StatusBadge :tone="user.isActive ? 'success' : 'neutral'">{{ user.isActive ? '啟用中' : '已停用' }}</StatusBadge>
          </td>
          <td v-if="$slots.actions" class="table__actions">
            <slot name="actions" :user="user" />
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

.table__row--inactive td {
  color: var(--color-text-muted);
}

.table__name {
  font-weight: 600;
}

.table__actions-head {
  width: 1%;
}

.table__actions {
  display: flex;
  gap: 6px;
}
</style>
