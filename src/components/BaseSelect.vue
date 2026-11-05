<script setup lang="ts">
import { useId } from 'vue'

export interface SelectOption {
  value: string | number
  label: string
}

withDefaults(
  defineProps<{
    label: string
    options: SelectOption[]
    disabled?: boolean
  }>(),
  { disabled: false },
)

const modelValue = defineModel<string | number>({ required: true })
const selectId = useId()
</script>

<template>
  <div class="select">
    <label :for="selectId" class="select__label">{{ label }}</label>
    <select :id="selectId" v-model="modelValue" class="select__control" :disabled="disabled">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.select {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.select__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.select__control {
  min-width: 160px;
  min-height: 40px;
  padding: 0 36px 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%2364748b' stroke-width='1.6'%3E%3Cpath d='M6 8l4 4 4-4'/%3E%3C/svg%3E")
    no-repeat right 10px center / 18px;
  font-size: 14px;
  appearance: none;
  cursor: pointer;
}

.select__control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.select__control:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
