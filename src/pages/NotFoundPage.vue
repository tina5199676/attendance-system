<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div class="not-found">
    <EmptyState title="找不到頁面" description="你要前往的頁面不存在，或網址已經變更。">
      <template #actions>
        <RouterLink to="/">
          <BaseButton variant="secondary">回到首頁</BaseButton>
        </RouterLink>
      </template>
    </EmptyState>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px 16px;
}

.not-found > * {
  width: 100%;
  max-width: 480px;
}
</style>
