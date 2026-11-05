<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header class="page-header">
    <div class="page-header__text">
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="description" class="page-header__description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header__title {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
}

.page-header__description {
  margin-top: 4px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.page-header__actions {
  display: flex;
  gap: 8px;
}
</style>
