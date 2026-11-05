<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="請假管理" description="提出請假申請並追蹤審核進度。" />
    <EmptyState
      title="請假功能開發中"
      description="請假申請表單與審核流程將在後端 API 確認後實作。"
    />
  </div>
</template>
