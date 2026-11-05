<script setup lang="ts">
import { ref } from 'vue'

/**
 * 圖表卡片：標題、說明與「圖表 / 表格」切換。
 * 每張圖都提供表格檢視，讓不依賴顏色或滑鼠的使用者也能讀到同一份數字。
 */
defineProps<{
  title: string
  subtitle?: string
}>()

type View = 'chart' | 'table'
const view = ref<View>('chart')
</script>

<template>
  <section class="chart-card">
    <header class="chart-card__head">
      <div>
        <h2 class="chart-card__title">{{ title }}</h2>
        <p v-if="subtitle" class="chart-card__subtitle">{{ subtitle }}</p>
      </div>
      <div class="chart-card__toggle" role="group" aria-label="切換檢視方式">
        <button type="button" :class="{ 'is-active': view === 'chart' }" :aria-pressed="view === 'chart'" @click="view = 'chart'">圖表</button>
        <button type="button" :class="{ 'is-active': view === 'table' }" :aria-pressed="view === 'table'" @click="view = 'table'">表格</button>
      </div>
    </header>

    <div class="chart-card__body">
      <slot v-if="view === 'chart'" />
      <slot v-else name="table" />
    </div>
  </section>
</template>

<style scoped>
.chart-card {
  display: flex;
  flex-direction: column;
  padding: 20px 22px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.chart-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.chart-card__title {
  font-size: 15px;
  font-weight: 700;
}

.chart-card__subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.chart-card__toggle {
  display: flex;
  flex-shrink: 0;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.chart-card__toggle button {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
}

.chart-card__toggle button.is-active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.chart-card__body {
  flex: 1;
}

/* 表格檢視共用樣式 */
.chart-card__body :deep(.chart-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.chart-card__body :deep(.chart-table th),
.chart-card__body :deep(.chart-table td) {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.chart-card__body :deep(.chart-table th) {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.chart-card__body :deep(.chart-table td.num),
.chart-card__body :deep(.chart-table th.num) {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
