<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTextarea from '@/components/BaseTextarea.vue'
import { LEAVE_TYPE_LABELS, type LeaveDecision, type LeaveRequest } from '@/types/leave'
import { formatDateLabel } from '@/utils/date'
import { leaveDays } from './leaveStatus'

/** 管理員審核表單：顯示申請摘要，填寫意見後核准或駁回 */
defineProps<{
  request: LeaveRequest
  submitting: boolean
}>()

const emit = defineEmits<{
  decide: [decision: LeaveDecision, comment: string]
  cancel: []
}>()

const comment = ref('')
</script>

<template>
  <div class="review">
    <dl class="review__summary">
      <div>
        <dt>申請人</dt>
        <dd>{{ request.userName }}<span v-if="request.enterpriseName" class="review__muted">・{{ request.enterpriseName }}</span></dd>
      </div>
      <div>
        <dt>假別</dt>
        <dd>{{ LEAVE_TYPE_LABELS[request.type] }}</dd>
      </div>
      <div>
        <dt>期間</dt>
        <dd>
          {{ formatDateLabel(request.startDate) }} ～ {{ formatDateLabel(request.endDate) }}
          <span class="review__muted">（{{ leaveDays(request.startDate, request.endDate) }} 天）</span>
        </dd>
      </div>
      <div>
        <dt>事由</dt>
        <dd>{{ request.reason }}</dd>
      </div>
    </dl>

    <BaseTextarea v-model="comment" label="審核意見" placeholder="選填，會顯示給申請人" :rows="3" :disabled="submitting" />

    <div class="review__actions">
      <BaseButton variant="ghost" :disabled="submitting" @click="emit('cancel')">取消</BaseButton>
      <BaseButton variant="danger" :loading="submitting" @click="emit('decide', 'rejected', comment)">駁回</BaseButton>
      <BaseButton :loading="submitting" @click="emit('decide', 'approved', comment)">核准</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.review {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.review__summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: var(--color-bg);
  font-size: 14px;
}

.review__summary dt {
  font-size: 12px;
  color: var(--color-text-muted);
}

.review__summary dd {
  font-weight: 500;
}

.review__muted {
  font-weight: 400;
  color: var(--color-text-muted);
}

.review__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
