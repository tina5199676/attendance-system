<script setup lang="ts">
import { reactive } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect, { type SelectOption } from '@/components/BaseSelect.vue'
import BaseTextarea from '@/components/BaseTextarea.vue'
import { LEAVE_TYPE_LABELS, type LeaveFormPayload, type LeaveType } from '@/types/leave'
import { toDateKey } from '@/utils/date'

/**
 * 請假申請表單：負責欄位、驗證與送出事件，
 * 真正呼叫 API 的動作交給父層，表單才能在不同情境重複使用。
 */
defineProps<{
  submitting: boolean
}>()

const emit = defineEmits<{
  submit: [payload: LeaveFormPayload]
  cancel: []
}>()

const typeOptions: SelectOption[] = (Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((type) => ({
  value: type,
  label: LEAVE_TYPE_LABELS[type],
}))

const today = toDateKey(new Date())

const form = reactive<LeaveFormPayload>({
  type: 'personal',
  startDate: today,
  endDate: today,
  reason: '',
})

const errors = reactive({ startDate: '', endDate: '', reason: '' })

function validate(): boolean {
  errors.startDate = form.startDate ? '' : '請選擇開始日期'
  errors.endDate = !form.endDate
    ? '請選擇結束日期'
    : form.endDate < form.startDate
      ? '結束日期不可早於開始日期'
      : ''
  errors.reason = form.reason.trim().length < 2 ? '請簡述請假事由' : ''
  return !errors.startDate && !errors.endDate && !errors.reason
}

function handleSubmit(): void {
  if (!validate()) return
  emit('submit', { ...form })
}
</script>

<template>
  <form class="leave-form" novalidate @submit.prevent="handleSubmit">
    <BaseSelect v-model="form.type" label="假別" :options="typeOptions" :disabled="submitting" />

    <div class="leave-form__dates">
      <BaseInput v-model="form.startDate" label="開始日期" type="date" required :error="errors.startDate" :disabled="submitting" />
      <BaseInput v-model="form.endDate" label="結束日期" type="date" required :error="errors.endDate" :disabled="submitting" />
    </div>

    <BaseTextarea
      v-model="form.reason"
      label="事由"
      placeholder="請簡述請假原因"
      required
      :error="errors.reason"
      :disabled="submitting"
    />

    <div class="leave-form__actions">
      <BaseButton variant="secondary" :disabled="submitting" @click="emit('cancel')">取消</BaseButton>
      <BaseButton type="submit" :loading="submitting">送出申請</BaseButton>
    </div>
  </form>
</template>

<style scoped>
.leave-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.leave-form__dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.leave-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

@media (max-width: 480px) {
  .leave-form__dates {
    grid-template-columns: 1fr;
  }
}
</style>
