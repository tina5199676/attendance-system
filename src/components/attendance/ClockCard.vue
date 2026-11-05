<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { ATTENDANCE_STATUS_LABELS, type AttendanceRecord } from '@/types/attendance'
import { formatDateLabel, toDateKey, toTimeString } from '@/utils/date'
import { attendanceStatusTone } from './attendanceStatus'

/**
 * 今日打卡卡片：顯示即時時間與今天的打卡狀態，
 * 打卡動作透過 emit 交給父層處理，本身不碰 store（保持單一職責）。
 */
const props = defineProps<{
  record: AttendanceRecord | null
  clocking: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  clockIn: []
  clockOut: []
}>()

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined

// 每秒更新一次時間；元件卸載時一定要清掉計時器，避免記憶體洩漏
onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

function canClockIn(): boolean {
  return props.record === null
}

function canClockOut(): boolean {
  return props.record !== null && props.record.clockIn !== null && props.record.clockOut === null
}
</script>

<template>
  <section class="clock-card" aria-labelledby="clock-title">
    <div class="clock-card__time">
      <p class="clock-card__date">{{ formatDateLabel(toDateKey(now)) }}</p>
      <p id="clock-title" class="clock-card__clock">{{ toTimeString(now) }}</p>
      <StatusBadge v-if="record" :tone="attendanceStatusTone(record.status)">
        {{ ATTENDANCE_STATUS_LABELS[record.status] }}
      </StatusBadge>
      <StatusBadge v-else tone="neutral">尚未打卡</StatusBadge>
    </div>

    <dl class="clock-card__records">
      <div class="clock-card__record">
        <dt>上班</dt>
        <dd>{{ record?.clockIn ?? '--:--' }}</dd>
      </div>
      <div class="clock-card__record">
        <dt>下班</dt>
        <dd>{{ record?.clockOut ?? '--:--' }}</dd>
      </div>
    </dl>

    <div class="clock-card__actions">
      <BaseButton :loading="clocking" :disabled="!canClockIn()" @click="emit('clockIn')">上班打卡</BaseButton>
      <BaseButton variant="secondary" :loading="clocking" :disabled="!canClockOut()" @click="emit('clockOut')">
        下班打卡
      </BaseButton>
    </div>

    <p v-if="errorMessage" class="clock-card__error" role="alert">{{ errorMessage }}</p>
    <p v-else-if="record?.clockOut" class="clock-card__hint">今天的打卡已完成，辛苦了。</p>
  </section>
</template>

<style scoped>
.clock-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 24px 32px;
  padding: 24px 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.clock-card__time {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.clock-card__date {
  font-size: 13px;
  color: var(--color-text-muted);
}

.clock-card__clock {
  font-size: 36px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.clock-card__records {
  display: flex;
  gap: 32px;
}

.clock-card__record dt {
  font-size: 12px;
  color: var(--color-text-muted);
}

.clock-card__record dd {
  font-size: 20px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.clock-card__actions {
  display: flex;
  gap: 8px;
}

.clock-card__error,
.clock-card__hint {
  grid-column: 1 / -1;
  font-size: 13px;
}

.clock-card__error {
  color: var(--color-danger);
}

.clock-card__hint {
  color: var(--color-text-muted);
}

@media (max-width: 860px) {
  .clock-card {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px;
  }

  .clock-card__actions {
    flex-direction: column;
  }
}
</style>
