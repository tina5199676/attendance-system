<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

<template>
  <Teleport to="body">
    <div class="toasts" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast">
        <div v-for="item in toast.toasts" :key="item.id" class="toast" :class="`toast--${item.tone}`" role="status">
          <span class="toast__message">{{ item.message }}</span>
          <button type="button" class="toast__close" aria-label="關閉通知" @click="toast.dismiss(item.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toasts {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(360px, calc(100vw - 32px));
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  font-size: 14px;
  pointer-events: auto;
}

.toast--success {
  border-left-color: var(--color-success);
}

.toast--error {
  border-left-color: var(--color-danger);
}

.toast__message {
  flex: 1;
}

.toast__close {
  font-size: 18px;
  line-height: 1;
  color: var(--color-text-subtle);
  cursor: pointer;
}

.toast__close:hover {
  color: var(--color-text);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
