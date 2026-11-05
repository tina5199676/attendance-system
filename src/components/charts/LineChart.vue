<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementSize } from '@/composables/useElementSize'
import { niceTicks } from '@/utils/attendanceStats'
import ChartTooltip from './ChartTooltip.vue'

export interface LinePoint {
  label: string
  value: number | null
}

/**
 * 單一序列折線圖（純 SVG，無第三方套件）。
 * - 容器寬度由 ResizeObserver 取得，座標全部以像素計算，文字不會被拉伸
 * - 十字線會吸附到最近的資料點，鍵盤左右鍵也能移動
 * - 只在最後一點放直接標籤，其餘數值交給 Y 軸與提示框
 */
const props = withDefaults(
  defineProps<{
    points: LinePoint[]
    /** 固定 Y 軸最大值（例如百分比用 100）；未設定時依資料自動計算 */
    yMax?: number
    format?: (value: number) => string
    height?: number
    seriesName?: string
  }>(),
  {
    yMax: undefined,
    format: (value: number) => String(value),
    height: 220,
    seriesName: '',
  },
)

const container = ref<HTMLElement | null>(null)
const { width } = useElementSize(container)

const margin = { top: 16, right: 56, bottom: 28, left: 40 }

const innerWidth = computed(() => Math.max(0, width.value - margin.left - margin.right))
const innerHeight = computed(() => props.height - margin.top - margin.bottom)

const ticks = computed(() => {
  if (props.yMax !== undefined) {
    const step = props.yMax / 4
    return [0, step, step * 2, step * 3, props.yMax]
  }
  const max = Math.max(0, ...props.points.map((p) => p.value ?? 0))
  return niceTicks(max)
})

const domainMax = computed(() => ticks.value[ticks.value.length - 1] ?? 1)

function x(index: number): number {
  const count = props.points.length
  if (count <= 1) return margin.left + innerWidth.value / 2
  return margin.left + (index / (count - 1)) * innerWidth.value
}

function y(value: number): number {
  return margin.top + innerHeight.value - (value / domainMax.value) * innerHeight.value
}

/** 折線路徑：遇到 null 中斷，之後重新以 M 開始 */
const linePath = computed(() => {
  let path = ''
  let pen = false
  props.points.forEach((point, index) => {
    if (point.value === null) {
      pen = false
      return
    }
    path += `${pen ? 'L' : 'M'}${x(index).toFixed(1)},${y(point.value).toFixed(1)} `
    pen = true
  })
  return path.trim()
})

/** 面積淡色：只畫連續有值的區段 */
const areaPath = computed(() => {
  const segments: string[] = []
  let current: number[] = []
  const flush = () => {
    if (current.length < 2) {
      current = []
      return
    }
    const first = current[0] as number
    const last = current[current.length - 1] as number
    const baseline = y(0).toFixed(1)
    const top = current.map((i) => `L${x(i).toFixed(1)},${y(props.points[i]?.value ?? 0).toFixed(1)}`).join(' ')
    segments.push(`M${x(first).toFixed(1)},${baseline} ${top} L${x(last).toFixed(1)},${baseline} Z`)
    current = []
  }
  props.points.forEach((point, index) => {
    if (point.value === null) flush()
    else current.push(index)
  })
  flush()
  return segments.join(' ')
})

const lastIndex = computed(() => {
  for (let i = props.points.length - 1; i >= 0; i -= 1) {
    if (props.points[i]?.value !== null) return i
  }
  return -1
})

// ---- 互動 ----
const activeIndex = ref<number | null>(null)
const activePoint = computed(() => (activeIndex.value === null ? null : (props.points[activeIndex.value] ?? null)))

function handlePointerMove(event: PointerEvent): void {
  if (!container.value || props.points.length === 0) return
  const rect = container.value.getBoundingClientRect()
  const px = event.clientX - rect.left
  let nearest = 0
  let best = Infinity
  props.points.forEach((_, index) => {
    const distance = Math.abs(x(index) - px)
    if (distance < best) {
      best = distance
      nearest = index
    }
  })
  activeIndex.value = nearest
}

function handleKeydown(event: KeyboardEvent): void {
  if (props.points.length === 0) return
  const current = activeIndex.value ?? lastIndex.value
  if (event.key === 'ArrowLeft') {
    activeIndex.value = Math.max(0, current - 1)
    event.preventDefault()
  } else if (event.key === 'ArrowRight') {
    activeIndex.value = Math.min(props.points.length - 1, current + 1)
    event.preventDefault()
  }
}

const skipEvery = computed(() => (props.points.length > 8 ? Math.ceil(props.points.length / 8) : 1))
</script>

<template>
  <div ref="container" class="line-chart" :style="{ height: `${height}px` }">
    <svg
      v-if="width > 0"
      :width="width"
      :height="height"
      class="line-chart__svg"
      tabindex="0"
      role="img"
      :aria-label="seriesName"
      @pointermove="handlePointerMove"
      @pointerleave="activeIndex = null"
      @keydown="handleKeydown"
      @focus="activeIndex = lastIndex === -1 ? null : lastIndex"
      @blur="activeIndex = null"
    >
      <!-- 格線與 Y 軸刻度 -->
      <g v-for="tick in ticks" :key="tick">
        <line :x1="margin.left" :x2="width - margin.right" :y1="y(tick)" :y2="y(tick)" class="line-chart__grid" />
        <text :x="margin.left - 8" :y="y(tick)" class="line-chart__tick" text-anchor="end" dominant-baseline="middle">
          {{ format(tick) }}
        </text>
      </g>

      <!-- X 軸標籤 -->
      <template v-for="(point, index) in points" :key="point.label">
        <text
          v-if="index % skipEvery === 0 || index === points.length - 1"
          :x="x(index)"
          :y="height - 8"
          class="line-chart__tick"
          text-anchor="middle"
        >
          {{ point.label }}
        </text>
      </template>

      <path :d="areaPath" class="line-chart__area" />
      <path :d="linePath" class="line-chart__line" />

      <!-- 十字線 -->
      <line
        v-if="activeIndex !== null"
        :x1="x(activeIndex)"
        :x2="x(activeIndex)"
        :y1="margin.top"
        :y2="margin.top + innerHeight"
        class="line-chart__crosshair"
      />

      <!-- 資料點：外圈是表面色的 2px ring -->
      <template v-for="(point, index) in points" :key="`dot-${point.label}`">
        <circle
          v-if="point.value !== null"
          :cx="x(index)"
          :cy="y(point.value)"
          :r="activeIndex === index ? 5 : 4"
          class="line-chart__dot"
        />
      </template>

      <!-- 端點直接標籤 -->
      <text
        v-if="lastIndex !== -1 && points[lastIndex]?.value !== null"
        :x="x(lastIndex) + 10"
        :y="y(points[lastIndex]?.value ?? 0)"
        class="line-chart__end-label"
        dominant-baseline="middle"
      >
        {{ format(points[lastIndex]?.value ?? 0) }}
      </text>
    </svg>

    <ChartTooltip
      :visible="activePoint !== null"
      :x="activeIndex === null ? 0 : x(activeIndex)"
      :y="activePoint?.value === null || activePoint?.value === undefined ? margin.top : y(activePoint.value)"
      :container-width="width"
    >
      <template v-if="activePoint">
        <div class="tooltip__title">{{ activePoint.label }}</div>
        <div class="tooltip__row">
          <span class="tooltip__key" :style="{ background: 'var(--chart-series)' }" />
          <span class="tooltip__value">{{ activePoint.value === null ? '無資料' : format(activePoint.value) }}</span>
          <span v-if="seriesName" class="tooltip__label">{{ seriesName }}</span>
        </div>
      </template>
    </ChartTooltip>
  </div>
</template>

<style scoped>
.line-chart {
  position: relative;
  width: 100%;
}

.line-chart__svg {
  display: block;
  overflow: visible;
  outline: none;
  touch-action: none;
}

.line-chart__svg:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
  border-radius: 4px;
}

.line-chart__grid {
  stroke: var(--chart-grid);
  stroke-width: 1;
}

.line-chart__tick {
  font-size: 11px;
  fill: var(--color-text-subtle);
}

.line-chart__area {
  fill: var(--chart-series);
  fill-opacity: 0.1;
}

.line-chart__line {
  fill: none;
  stroke: var(--chart-series);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.line-chart__crosshair {
  stroke: var(--chart-axis);
  stroke-width: 1;
}

.line-chart__dot {
  fill: var(--chart-series);
  stroke: var(--color-surface);
  stroke-width: 2;
}

.line-chart__end-label {
  font-size: 12px;
  font-weight: 700;
  fill: var(--color-text);
}
</style>
