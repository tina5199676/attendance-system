<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="使用者管理" description="管理學員、企業與管理員帳號。" />
    <EmptyState
      title="使用者管理功能開發中"
      description="此頁面僅系統管理員可見，帳號列表與編輯功能將在後端 API 確認後實作。"
    />
  </div>
</template>
