<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <EmptyState
    title="沒有權限查看此頁面"
    description="你的帳號角色無法存取這個功能，如有需要請聯絡系統管理員。"
  >
    <template #actions>
      <RouterLink :to="{ name: 'dashboard' }">
        <BaseButton variant="secondary">回到總覽</BaseButton>
      </RouterLink>
    </template>
  </EmptyState>
</template>
