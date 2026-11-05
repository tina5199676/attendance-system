<script setup lang="ts">
import { computed } from 'vue'
import { LEAVE_TYPE_LABELS, type LeaveRequest } from '@/types/leave'
import { buildLeaveCalendar, type CalendarDay } from '@/utils/leaveCalendar'

/**
 * 請假月曆。
 * - 格子底色依「核准請假人數」分三階深淺（單一色相、越多越深），讓人力缺口一眼可見
 * - 待審核的申請以虛線標籤呈現，不計入底色
 * - 有申請的日子是按鈕，點擊或鍵盤 Enter 會送出 selectDay 事件
 */
const props = defineProps<{
  monthKey: string
  requests: LeaveRequest[]
  /** 企業／管理員顯示人名；學員顯示假別 */
  showUser: boolean
}>()

const emit = defineEmits<{
  selectDay: [day: CalendarDay]
}>()

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const MAX_CHIPS = 2

const days = computed(() => buildLeaveCalendar(props.monthKey, props.requests))

function tintLevel(day: CalendarDay): number {
  return Math.min(day.approvedCount, 3)
}

interface Chip {
  key: number
  text: string
  pending: boolean
}

function chips(day: CalendarDay): Chip[] {
  return day.requests.map((request) => ({
    key: request.id,
    text: props.showUser ? request.userName : LEAVE_TYPE_LABELS[request.type],
    pending: request.status === 'pending',
  }))
}

function ariaLabel(day: CalendarDay): string {
  if (day.requests.length === 0) return `${day.key}，無請假`
  return `${day.key}，核准 ${day.approvedCount} 人，待審核 ${day.pendingCount} 人`
}
</script>

<template>
  <div class="calendar">
    <div class="calendar__weekdays" aria-hidden="true">
      <span v-for="name in WEEKDAYS" :key="name" class="calendar__weekday">{{ name }}</span>
    </div>

    <div class="calendar__grid">
      <component
        :is="day.requests.length > 0 ? 'button' : 'div'"
        v-for="day in days"
        :key="day.key"
        :type="day.requests.length > 0 ? 'button' : undefined"
        class="calendar__cell"
        :class="[
          `calendar__cell--level-${tintLevel(day)}`,
          {
            'calendar__cell--outside': !day.inMonth,
            'calendar__cell--weekend': day.isWeekend,
            'calendar__cell--today': day.isToday,
            'calendar__cell--clickable': day.requests.length > 0,
          },
        ]"
        :aria-label="ariaLabel(day)"
        @click="day.requests.length > 0 && emit('selectDay', day)"
      >
        <span class="calendar__day">{{ day.day }}</span>
        <span v-if="showUser && day.approvedCount > 0" class="calendar__count">{{ day.approvedCount }} 人</span>

        <span class="calendar__chips">
          <span
            v-for="chip in chips(day).slice(0, MAX_CHIPS)"
            :key="chip.key"
            class="calendar__chip"
            :class="{ 'calendar__chip--pending': chip.pending }"
          >
            {{ chip.text }}
          </span>
          <span v-if="day.requests.length > MAX_CHIPS" class="calendar__more">+{{ day.requests.length - MAX_CHIPS }}</span>
        </span>
      </component>
    </div>

    <ul class="calendar__legend" aria-label="圖例">
      <li v-if="showUser" class="calendar__legend-item">
        <span class="calendar__swatch calendar__cell--level-1" aria-hidden="true" />1 人
      </li>
      <li v-if="showUser" class="calendar__legend-item">
        <span class="calendar__swatch calendar__cell--level-2" aria-hidden="true" />2 人
      </li>
      <li v-if="showUser" class="calendar__legend-item">
        <span class="calendar__swatch calendar__cell--level-3" aria-hidden="true" />3 人以上
      </li>
      <li class="calendar__legend-item">
        <span class="calendar__chip calendar__legend-chip" aria-hidden="true">核准</span>
      </li>
      <li class="calendar__legend-item">
        <span class="calendar__chip calendar__chip--pending calendar__legend-chip" aria-hidden="true">待審核</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.calendar__weekdays,
.calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.calendar__weekdays {
  margin-bottom: 6px;
}

.calendar__weekday {
  padding: 4px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: center;
}

.calendar__grid {
  gap: 4px;
}

.calendar__cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-height: 88px;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font: inherit;
  color: var(--color-text);
  text-align: left;
}

.calendar__cell--weekend {
  background: var(--color-bg);
}

.calendar__cell--outside {
  opacity: 0.45;
}

.calendar__cell--today .calendar__day {
  background: var(--color-primary);
  color: #fff;
}

/* 單一色相、三階深淺：核准人數越多越深 */
.calendar__cell--level-1 {
  background: var(--calendar-level-1);
}

.calendar__cell--level-2 {
  background: var(--calendar-level-2);
}

.calendar__cell--level-3 {
  background: var(--calendar-level-3);
}

.calendar__cell--clickable {
  cursor: pointer;
  transition: box-shadow 0.15s ease;
}

.calendar__cell--clickable:hover {
  box-shadow: var(--shadow-md);
}

.calendar__cell--clickable:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.calendar__day {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.calendar__count {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text);
}

.calendar__chips {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.calendar__chip {
  display: block;
  max-width: 100%;
  padding: 1px 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: var(--color-surface);
  font-size: 11px;
  line-height: 1.5;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: var(--shadow-sm);
}

.calendar__chip--pending {
  border-style: dashed;
  border-color: var(--color-text-subtle);
  color: var(--color-text-muted);
  box-shadow: none;
}

.calendar__more {
  font-size: 11px;
  color: var(--color-text-muted);
}

.calendar__legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  margin-top: 12px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.calendar__legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.calendar__swatch {
  width: 14px;
  height: 14px;
  border: 1px solid var(--color-border);
  border-radius: 3px;
}

.calendar__legend-chip {
  display: inline-block;
  border-color: var(--color-border);
}

@media (max-width: 860px) {
  .calendar__cell {
    min-height: 64px;
    padding: 6px;
  }

  .calendar__chips {
    display: none;
  }
}
</style>
