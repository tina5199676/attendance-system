<script setup lang="ts">
/** 狀態標籤：用語意化的 tone 決定顏色，各功能自行對應狀態 → tone */
export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

withDefaults(defineProps<{ tone?: BadgeTone }>(), { tone: 'neutral' })
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.6;
  white-space: nowrap;
}

.badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.badge--success {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.badge--warning {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.badge--danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.badge--info {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.badge--neutral {
  background: var(--color-bg);
  color: var(--color-text-muted);
}
</style>
