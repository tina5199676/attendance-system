<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="出勤紀錄" description="查看每日上下班打卡與出勤狀態。" />
    <EmptyState
      title="出勤功能開發中"
      description="打卡與出勤紀錄列表將在後端 API 確認後實作。"
    />
  </div>
</template>
