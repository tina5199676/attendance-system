<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementSize } from '@/composables/useElementSize'
import ChartTooltip from './ChartTooltip.vue'

export interface RankedDetail {
  label: string
  value: number
}

export interface RankedItem {
  key: string | number
  label: string
  value: number
  detail?: RankedDetail[]
}

/**
 * 排序水平長條圖：名目類別（學員）比較數量，所以全部使用同一個顏色。
 * - 長條厚度 16px，資料端 4px 圓角、基線端方角
 * - 數值放在長條尖端，整列都是 hover 目標
 * - 高度隨列數成長，不固定高度以免 X 軸被裁掉
 */
const props = withDefaults(
  defineProps<{
    items: RankedItem[]
    unit?: string
  }>(),
  { unit: '' },
)

const container = ref<HTMLElement | null>(null)
const { width } = useElementSize(container)

const BAND = 32
const BAR = 16
const LABEL_WIDTH = 88
const VALUE_WIDTH = 44
const PADDING_TOP = 4

const height = computed(() => props.items.length * BAND + PADDING_TOP * 2)
const innerWidth = computed(() => Math.max(0, width.value - LABEL_WIDTH - VALUE_WIDTH))
const maxValue = computed(() => Math.max(1, ...props.items.map((item) => item.value)))

function barWidth(value: number): number {
  return (value / maxValue.value) * innerWidth.value
}

function rowY(index: number): number {
  return PADDING_TOP + index * BAND
}

/** 資料端圓角、基線端方角的長條路徑 */
function barPath(index: number, value: number): string {
  const w = barWidth(value)
  const x0 = LABEL_WIDTH
  const y0 = rowY(index) + (BAND - BAR) / 2
  const r = Math.min(4, w)
  if (w <= 0) return ''
  return [
    `M${x0},${y0}`,
    `h${w - r}`,
    `a${r},${r} 0 0 1 ${r},${r}`,
    `v${BAR - r * 2}`,
    `a${r},${r} 0 0 1 -${r},${r}`,
    `h-${w - r}`,
    'z',
  ].join(' ')
}

const activeIndex = ref<number | null>(null)
const activeItem = computed(() => (activeIndex.value === null ? null : (props.items[activeIndex.value] ?? null)))
</script>

<template>
  <div ref="container" class="ranked">
    <svg v-if="width > 0" :width="width" :height="height" class="ranked__svg" role="img" aria-label="排行">
      <line :x1="LABEL_WIDTH" :x2="LABEL_WIDTH" :y1="PADDING_TOP" :y2="height - PADDING_TOP" class="ranked__axis" />

      <g
        v-for="(item, index) in items"
        :key="item.key"
        class="ranked__row"
        :class="{ 'is-active': activeIndex === index }"
        tabindex="0"
        :aria-label="`${item.label} ${item.value}${unit}`"
        @pointerenter="activeIndex = index"
        @pointerleave="activeIndex = null"
        @focus="activeIndex = index"
        @blur="activeIndex = null"
      >
        <!-- 整列透明矩形作為 hover 目標 -->
        <rect :x="0" :y="rowY(index)" :width="width" :height="BAND" class="ranked__hit" />
        <text :x="LABEL_WIDTH - 10" :y="rowY(index) + BAND / 2" class="ranked__label" text-anchor="end" dominant-baseline="middle">
          {{ item.label }}
        </text>
        <path :d="barPath(index, item.value)" class="ranked__bar" />
        <text
          :x="LABEL_WIDTH + barWidth(item.value) + 8"
          :y="rowY(index) + BAND / 2"
          class="ranked__value"
          dominant-baseline="middle"
        >
          {{ item.value }}{{ unit }}
        </text>
      </g>
    </svg>

    <ChartTooltip
      :visible="activeItem !== null && (activeItem.detail?.length ?? 0) > 0"
      :x="activeItem ? LABEL_WIDTH + barWidth(activeItem.value) : 0"
      :y="activeIndex === null ? 0 : rowY(activeIndex) + BAND / 2"
      :container-width="width"
    >
      <template v-if="activeItem">
        <div class="tooltip__title">{{ activeItem.label }}</div>
        <div v-for="row in activeItem.detail" :key="row.label" class="tooltip__row">
          <span class="tooltip__value">{{ row.value }}</span>
          <span class="tooltip__label">{{ row.label }}</span>
        </div>
      </template>
    </ChartTooltip>
  </div>
</template>

<style scoped>
.ranked {
  position: relative;
  width: 100%;
}

.ranked__svg {
  display: block;
  overflow: visible;
}

.ranked__axis {
  stroke: var(--chart-axis);
  stroke-width: 1;
}

.ranked__row {
  outline: none;
}

.ranked__hit {
  fill: transparent;
}

.ranked__row.is-active .ranked__hit {
  fill: var(--color-bg);
}

.ranked__row:focus-visible .ranked__hit {
  stroke: var(--color-primary);
  stroke-width: 1.5;
  rx: 4;
}

.ranked__label {
  font-size: 12px;
  fill: var(--color-text);
}

.ranked__bar {
  fill: var(--chart-series);
  transition: opacity 0.12s ease;
}

.ranked__row.is-active .ranked__bar {
  opacity: 0.85;
}

.ranked__value {
  font-size: 12px;
  font-weight: 600;
  fill: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
