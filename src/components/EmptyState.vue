<script setup lang="ts">
/**
 * 空狀態 / 提示區塊：用於沒有資料、功能尚未開放、錯誤頁等情境。
 * 透過 actions slot 可放入返回或重試按鈕。
 */
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon" aria-hidden="true">
      <slot name="icon">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="5" width="18" height="15" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </slot>
    </div>
    <h2 class="empty-state__title">{{ title }}</h2>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    <div v-if="$slots.actions" class="empty-state__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 24px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  text-align: center;
}

.empty-state__icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.empty-state__title {
  font-size: 18px;
  font-weight: 700;
}

.empty-state__description {
  max-width: 360px;
  margin-top: 6px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.empty-state__actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}
</style>
