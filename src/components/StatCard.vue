<script setup lang="ts">
import type { BadgeTone } from '@/components/StatusBadge.vue'

/** 統計卡片：一個數字加上說明，用 tone 標示數字的語意顏色 */
withDefaults(
  defineProps<{
    label: string
    value: string | number
    hint?: string
    tone?: BadgeTone
  }>(),
  { hint: '', tone: 'neutral' },
)
</script>

<template>
  <div class="stat">
    <p class="stat__label">{{ label }}</p>
    <p class="stat__value" :class="`stat__value--${tone}`">{{ value }}</p>
    <p v-if="hint" class="stat__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.stat {
  padding: 18px 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.stat__label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.stat__value {
  margin-top: 6px;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.stat__value--success {
  color: var(--color-success);
}

.stat__value--warning {
  color: var(--color-warning);
}

.stat__value--danger {
  color: var(--color-danger);
}

.stat__value--info {
  color: var(--color-primary);
}

.stat__hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-subtle);
}
</style>
