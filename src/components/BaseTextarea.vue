<script setup lang="ts">
import { useId } from 'vue'

withDefaults(
  defineProps<{
    label: string
    placeholder?: string
    error?: string
    rows?: number
    required?: boolean
    disabled?: boolean
  }>(),
  { placeholder: '', error: '', rows: 4, required: false, disabled: false },
)

const modelValue = defineModel<string>({ default: '' })
const inputId = useId()
const errorId = `${inputId}-error`
</script>

<template>
  <div class="field" :class="{ 'field--error': error }">
    <label :for="inputId" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true">*</span>
    </label>
    <textarea
      :id="inputId"
      v-model="modelValue"
      class="field__input"
      :placeholder="placeholder"
      :rows="rows"
      :required="required"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
    />
    <p v-if="error" :id="errorId" class="field__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 14px;
  font-weight: 600;
}

.field__required {
  margin-left: 2px;
  color: var(--color-danger);
}

.field__input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 15px;
  line-height: 1.6;
  resize: vertical;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.field__input::placeholder {
  color: var(--color-text-subtle);
}

.field__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.field__input:disabled {
  background: var(--color-bg);
  cursor: not-allowed;
}

.field--error .field__input {
  border-color: var(--color-danger);
}

.field__error {
  font-size: 13px;
  color: var(--color-danger);
}
</style>
