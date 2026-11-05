<script setup lang="ts">
import { onUnmounted, useId, watch } from 'vue'

/**
 * 對話框：用 Teleport 渲染到 body 最外層，避免被父層的 overflow 或 z-index 影響。
 * 支援點擊遮罩與按 Esc 關閉，開啟時鎖住背景捲動。
 */
const props = defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

const titleId = useId()

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      window.addEventListener('keydown', handleKeydown)
    } else {
      window.removeEventListener('keydown', handleKeydown)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" @click.self="emit('close')">
        <div class="modal__dialog" role="dialog" aria-modal="true" :aria-labelledby="titleId">
          <header class="modal__header">
            <h2 :id="titleId" class="modal__title">{{ title }}</h2>
            <button type="button" class="modal__close" aria-label="關閉" @click="emit('close')">×</button>
          </header>
          <div class="modal__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.45);
}

.modal__dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 520px;
  max-height: calc(100vh - 32px);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 0;
}

.modal__title {
  font-size: 18px;
  font-weight: 700;
}

.modal__close {
  font-size: 24px;
  line-height: 1;
  color: var(--color-text-subtle);
  cursor: pointer;
}

.modal__close:hover {
  color: var(--color-text);
}

.modal__body {
  padding: 16px 24px 24px;
  overflow-y: auto;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}

.modal-enter-active .modal__dialog,
.modal-leave-active .modal__dialog {
  transition: transform 0.18s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal__dialog,
.modal-leave-to .modal__dialog {
  transform: translateY(12px);
}
</style>
