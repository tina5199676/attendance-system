<script setup lang="ts">
export interface SegmentedOption<T extends string = string> {
  value: T
  label: string
}

/** 小型切換器：少量互斥選項（例如「列表／日曆」、「圖表／表格」） */
defineProps<{
  options: SegmentedOption[]
  label: string
}>()

const modelValue = defineModel<string>({ required: true })
</script>

<template>
  <div class="segmented-control" role="group" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="segmented-control__option"
      :class="{ 'is-active': modelValue === option.value }"
      :aria-pressed="modelValue === option.value"
      @click="modelValue = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented-control {
  display: inline-flex;
  flex-shrink: 0;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}

.segmented-control__option {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.segmented-control__option:hover {
  color: var(--color-text);
}

.segmented-control__option.is-active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
</style>
