<script setup lang="ts">
import { useId } from 'vue'

/**
 * 表單輸入框：自帶 label、錯誤訊息與無障礙屬性。
 * 使用 defineModel 讓父層可以直接 v-model 綁定。
 */
withDefaults(
  defineProps<{
    label: string
    type?: 'text' | 'email' | 'password' | 'date' | 'number'
    placeholder?: string
    error?: string
    autocomplete?: string
    required?: boolean
    disabled?: boolean
  }>(),
  {
    type: 'text',
    placeholder: '',
    error: '',
    autocomplete: 'off',
    required: false,
    disabled: false,
  },
)

const modelValue = defineModel<string>({ default: '' })

// useId 會產生在 SSR/CSR 都一致的唯一 id，用來連結 label 與 input
const inputId = useId()
const errorId = `${inputId}-error`
</script>

<template>
  <div class="field" :class="{ 'field--error': error }">
    <label :for="inputId" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true">*</span>
    </label>
    <input
      :id="inputId"
      v-model="modelValue"
      class="field__input"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
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
  color: var(--color-text);
}

.field__required {
  margin-left: 2px;
  color: var(--color-danger);
}

.field__input {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 15px;
  color: var(--color-text);
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

.field--error .field__input:focus {
  box-shadow: 0 0 0 3px var(--color-danger-soft);
}

.field__error {
  font-size: 13px;
  color: var(--color-danger);
}
</style>
