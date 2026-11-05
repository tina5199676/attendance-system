<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementSize } from '@/composables/useElementSize'
import ChartTooltip from './ChartTooltip.vue'

export interface SegmentPart {
  key: string
  label: string
  value: number
  color: string
}

/**
 * 高段式長條（tall segmented bar）：一個整體拆成幾個部分，一眼看出比例。
 * - 區塊之間留 2px 表面色間隙，不畫邊框
 * - 區塊夠寬才印上百分比，太窄的交給提示框與表格
 * - 圖例只列名稱，不重複數字
 */
const props = defineProps<{
  parts: SegmentPart[]
}>()

const container = ref<HTMLElement | null>(null)
const { width } = useElementSize(container)

const total = computed(() => props.parts.reduce((sum, part) => sum + part.value, 0))

const segments = computed(() =>
  props.parts
    .filter((part) => part.value > 0)
    .map((part) => {
      const share = total.value > 0 ? part.value / total.value : 0
      const px = share * width.value
      return {
        ...part,
        share,
        shareLabel: `${Math.round(share * 100)}%`,
        showLabel: px >= 48,
      }
    }),
)

const activeKey = ref<string | null>(null)
const active = computed(() => segments.value.find((segment) => segment.key === activeKey.value) ?? null)

/** 提示框放在 hover 區塊的水平中心 */
const activeX = computed(() => {
  if (!active.value) return 0
  let offset = 0
  for (const segment of segments.value) {
    if (segment.key === active.value.key) return (offset + segment.share / 2) * width.value
    offset += segment.share
  }
  return 0
})
</script>

<template>
  <div class="segmented">
    <div ref="container" class="segmented__bar" role="img" :aria-label="`共 ${total} 天`">
      <template v-if="total > 0">
        <div
          v-for="segment in segments"
          :key="segment.key"
          class="segmented__part"
          :class="{ 'is-active': activeKey === segment.key, 'has-label': segment.showLabel }"
          :style="{ flexGrow: segment.value, background: segment.color }"
          tabindex="0"
          role="img"
          :aria-label="`${segment.label} ${segment.value} 天，占 ${segment.shareLabel}`"
          @pointerenter="activeKey = segment.key"
          @pointerleave="activeKey = null"
          @focus="activeKey = segment.key"
          @blur="activeKey = null"
        >
          <span v-if="segment.showLabel" class="segmented__label">{{ segment.shareLabel }}</span>
        </div>
      </template>
      <div v-else class="segmented__empty">無資料</div>

      <ChartTooltip :visible="active !== null" :x="activeX" :y="-6" :container-width="width">
        <template v-if="active">
          <div class="tooltip__row">
            <span class="tooltip__key" :style="{ background: active.color }" />
            <span class="tooltip__value">{{ active.value }} 天</span>
            <span class="tooltip__label">{{ active.label }}・{{ active.shareLabel }}</span>
          </div>
        </template>
      </ChartTooltip>
    </div>

    <ul class="segmented__legend" aria-label="圖例">
      <li v-for="part in parts" :key="part.key" class="segmented__legend-item">
        <span class="segmented__swatch" :style="{ background: part.color }" aria-hidden="true" />
        {{ part.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.segmented__bar {
  position: relative;
  display: flex;
  gap: 2px;
  height: 28px;
}

.segmented__part {
  display: flex;
  align-items: center;
  min-width: 0;
  border-radius: 4px;
  outline: none;
  transition: filter 0.12s ease;
}

.segmented__part.has-label {
  padding: 0 8px;
}

.segmented__part.is-active {
  filter: brightness(1.08);
}

.segmented__part:focus-visible {
  box-shadow: 0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-primary);
}

.segmented__label {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.segmented__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: 4px;
  background: var(--color-bg);
  font-size: 12px;
  color: var(--color-text-subtle);
}

.segmented__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-top: 12px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.segmented__legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.segmented__swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
</style>
