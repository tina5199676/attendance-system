<script setup lang="ts">
import { computed } from 'vue'

/**
 * 圖表提示框：以絕對定位放在圖表容器內。
 * 當提示框靠近右側邊界時自動翻到指標左邊，避免被裁切。
 */
const props = defineProps<{
  visible: boolean
  x: number
  y: number
  containerWidth: number
}>()

const flip = computed(() => props.containerWidth > 0 && props.x > props.containerWidth - 160)

const style = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  transform: flip.value ? 'translate(calc(-100% - 12px), -50%)' : 'translate(12px, -50%)',
}))
</script>

<template>
  <div v-show="visible" class="tooltip" :style="style" role="tooltip">
    <slot />
  </div>
</template>

<style scoped>
.tooltip {
  position: absolute;
  z-index: 5;
  min-width: 120px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text);
  pointer-events: none;
  white-space: nowrap;
}

.tooltip :deep(.tooltip__title) {
  margin-bottom: 4px;
  color: var(--color-text-muted);
}

.tooltip :deep(.tooltip__row) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tooltip :deep(.tooltip__key) {
  width: 10px;
  height: 2px;
  border-radius: 1px;
  flex-shrink: 0;
}

.tooltip :deep(.tooltip__value) {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.tooltip :deep(.tooltip__label) {
  color: var(--color-text-muted);
}
</style>
