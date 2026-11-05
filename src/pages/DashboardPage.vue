<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/types/user'

const auth = useAuthStore()

const greeting = computed(() => {
  if (!auth.user) return ''
  return `${auth.user.name}，歡迎回來`
})

const description = computed(() => {
  if (!auth.role) return ''
  const label = ROLE_LABELS[auth.role]
  return auth.user?.enterpriseName
    ? `${label}・${auth.user.enterpriseName}`
    : label
})
</script>

<template>
  <div>
    <PageHeader :title="greeting" :description="description" />
    <EmptyState
      title="總覽功能開發中"
      description="這裡之後會依角色顯示今日出勤狀態、待審核的請假申請等摘要資訊。"
    />
  </div>
</template>
