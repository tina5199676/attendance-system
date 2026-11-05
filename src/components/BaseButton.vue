<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

withDefaults(
  defineProps<{
    variant?: Variant
    type?: 'button' | 'submit'
    loading?: boolean
    disabled?: boolean
    /** 寬度撐滿容器 */
    block?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
    loading: false,
    disabled: false,
    block: false,
  },
)
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, { 'btn--block': block, 'btn--loading': loading }]"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <span class="btn__label"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn--block {
  width: 100%;
}

.btn--primary {
  background: var(--color-primary);
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn--secondary {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--color-bg);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-muted);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--color-bg);
  color: var(--color-text);
}

.btn--danger {
  background: var(--color-danger);
  color: #fff;
}

.btn--danger:hover:not(:disabled) {
  background: var(--color-danger-hover);
}

.btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: btn-spin 0.7s linear infinite;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
