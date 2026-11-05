<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseSelect, { type SelectOption } from '@/components/BaseSelect.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import ChartCard from '@/components/charts/ChartCard.vue'
import LineChart, { type LinePoint } from '@/components/charts/LineChart.vue'
import RankedBarChart, { type RankedItem } from '@/components/charts/RankedBarChart.vue'
import SegmentedBar, { type SegmentPart } from '@/components/charts/SegmentedBar.vue'
import { fetchAttendanceRecords } from '@/services/attendanceService'
import { fetchEnterpriseNames } from '@/services/userService'
import { useAuthStore } from '@/stores/auth'
import type { AttendanceQuery, AttendanceRecord } from '@/types/attendance'
import { anomaliesByUser, summarize } from '@/utils/attendanceStats'
import { formatMonthLabel, formatMonthShort, recentMonthKeys, toMonthKey } from '@/utils/date'

/**
 * 出勤統計頁。
 * 一次載入近 6 個月的紀錄，之後切換月份只在前端重新計算，不必重新請求；
 * 篩選列放在所有圖表上方，所有數字都來自同一份資料切片。
 */
const auth = useAuthStore()
const isStudent = computed(() => auth.role === 'student')
const isAdmin = computed(() => auth.role === 'admin')

// ---- 篩選列 ----
const months = recentMonthKeys(6).reverse()
const selectedMonth = ref(toMonthKey(new Date()))
const monthOptions: SelectOption[] = [...months].reverse().map((key) => ({ value: key, label: formatMonthLabel(key) }))

const enterpriseFilter = ref('')
const enterpriseNames = ref<string[]>([])
const enterpriseOptions = computed<SelectOption[]>(() => [
  { value: '', label: '全部企業' },
  ...enterpriseNames.value.map((name) => ({ value: name, label: name })),
])

/** 資料範圍：學員只看自己，企業看所屬，管理員可選企業 */
const scope = computed<Omit<AttendanceQuery, 'month'>>(() => {
  if (isStudent.value) return { userId: auth.user?.id }
  if (isAdmin.value) return { enterpriseName: enterpriseFilter.value || undefined }
  return { enterpriseName: auth.user?.enterpriseName ?? undefined }
})

// ---- 載入 ----
const recordsByMonth = ref<Record<string, AttendanceRecord[]>>({})
const loading = ref(false)
const loadedOnce = ref(false)
const error = ref('')

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const results = await Promise.all(months.map((month) => fetchAttendanceRecords({ month, ...scope.value })))
    recordsByMonth.value = Object.fromEntries(months.map((month, index) => [month, results[index] ?? []]))
    loadedOnce.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : '載入統計資料失敗'
  } finally {
    loading.value = false
  }
}

watch(scope, load, { immediate: true })

onMounted(async () => {
  if (isAdmin.value) enterpriseNames.value = await fetchEnterpriseNames()
})

// ---- 計算 ----
const summaries = computed(() => Object.fromEntries(months.map((m) => [m, summarize(recordsByMonth.value[m] ?? [])])))
const selected = computed(() => summaries.value[selectedMonth.value] ?? summarize([]))
const previousMonthKey = computed(() => months[months.indexOf(selectedMonth.value) - 1])
const previous = computed(() => (previousMonthKey.value ? summaries.value[previousMonthKey.value] : undefined))

const rateDelta = computed(() => {
  if (selected.value.rate === null || previous.value?.rate === null || previous.value?.rate === undefined) return null
  return Math.round((selected.value.rate - previous.value.rate) * 10) / 10
})

function formatRate(value: number | null): string {
  return value === null ? '—' : `${value}%`
}

const trendPoints = computed<LinePoint[]>(() =>
  months.map((m) => ({ label: formatMonthShort(m), value: summaries.value[m]?.rate ?? null })),
)

const segments = computed<SegmentPart[]>(() => [
  { key: 'normal', label: '正常', value: selected.value.normal, color: 'var(--chart-good)' },
  { key: 'late', label: '遲到／早退', value: selected.value.late + selected.value.earlyLeave, color: 'var(--chart-warning)' },
  { key: 'leave', label: '請假', value: selected.value.leave, color: 'var(--chart-info)' },
  { key: 'absent', label: '缺勤', value: selected.value.absent, color: 'var(--chart-critical)' },
])

const anomalies = computed(() => anomaliesByUser(recordsByMonth.value[selectedMonth.value] ?? []))
const rankedItems = computed<RankedItem[]>(() =>
  anomalies.value
    .filter((entry) => entry.total > 0)
    .slice(0, 8)
    .map((entry) => ({
      key: entry.userId,
      label: entry.userName,
      value: entry.total,
      detail: [
        { label: '遲到', value: entry.late },
        { label: '早退', value: entry.earlyLeave },
        { label: '缺勤', value: entry.absent },
      ],
    })),
)

const statCards = computed(() => [
  { label: '遲到', value: selected.value.late, tone: selected.value.late > 0 ? ('warning' as const) : ('neutral' as const) },
  { label: '早退', value: selected.value.earlyLeave, tone: selected.value.earlyLeave > 0 ? ('warning' as const) : ('neutral' as const) },
  { label: '缺勤', value: selected.value.absent, tone: selected.value.absent > 0 ? ('danger' as const) : ('neutral' as const) },
  { label: '請假', value: selected.value.leave, tone: 'info' as const },
])
</script>

<template>
  <div class="stats">
    <PageHeader
      title="出勤統計"
      :description="isStudent ? '檢視個人出勤率趨勢與本月狀態分布。' : '檢視學員出勤率趨勢、狀態分布與異常排行。'"
    />

    <div class="stats__filters">
      <BaseSelect v-model="selectedMonth" label="月份" :options="monthOptions" />
      <BaseSelect v-if="isAdmin" v-model="enterpriseFilter" label="企業" :options="enterpriseOptions" :disabled="loading" />
    </div>

    <LoadingState v-if="loading && !loadedOnce" text="載入統計資料中…" />

    <EmptyState v-else-if="error" title="載入失敗" :description="error">
      <template #actions>
        <BaseButton variant="secondary" @click="load">重新載入</BaseButton>
      </template>
    </EmptyState>

    <!-- 重新查詢時保留畫面、降低透明度，不閃爍不跳版 -->
    <div v-else class="stats__content" :class="{ 'is-refreshing': loading }">
      <div class="stats__kpis">
        <div class="stats__hero">
          <p class="stats__hero-label">{{ formatMonthLabel(selectedMonth) }}出勤率</p>
          <p class="stats__hero-value">{{ formatRate(selected.rate) }}</p>
          <p class="stats__hero-meta">
            <span
              v-if="rateDelta !== null"
              class="stats__delta"
              :class="rateDelta > 0 ? 'is-up' : rateDelta < 0 ? 'is-down' : ''"
            >
              {{ rateDelta > 0 ? '▲' : rateDelta < 0 ? '▼' : '—' }} {{ Math.abs(rateDelta) }} 個百分點
            </span>
            <span v-else class="stats__delta">無前月資料</span>
            <span class="stats__hero-hint">・實際出勤 {{ selected.present }} / 應出勤 {{ selected.expected }} 天</span>
          </p>
        </div>
        <StatCard v-for="card in statCards" :key="card.label" v-bind="card" :hint="formatMonthLabel(selectedMonth)" />
      </div>

      <div class="stats__grid">
        <ChartCard class="stats__span" title="出勤率趨勢" subtitle="近 6 個月，實際出勤 ÷ 應出勤（請假不計入應出勤）">
          <LineChart :points="trendPoints" :y-max="100" :format="(v) => `${v}%`" series-name="出勤率" />
          <template #table>
            <table class="chart-table">
              <thead>
                <tr><th>月份</th><th class="num">出勤率</th><th class="num">實際出勤</th><th class="num">應出勤</th></tr>
              </thead>
              <tbody>
                <tr v-for="m in months" :key="m">
                  <td>{{ formatMonthLabel(m) }}</td>
                  <td class="num">{{ formatRate(summaries[m]?.rate ?? null) }}</td>
                  <td class="num">{{ summaries[m]?.present ?? 0 }}</td>
                  <td class="num">{{ summaries[m]?.expected ?? 0 }}</td>
                </tr>
              </tbody>
            </table>
          </template>
        </ChartCard>

        <ChartCard :class="{ 'stats__span': isStudent }" title="出勤狀態分布" :subtitle="`${formatMonthLabel(selectedMonth)}，共 ${selected.total} 天`">
          <SegmentedBar :parts="segments" />
          <template #table>
            <table class="chart-table">
              <thead>
                <tr><th>狀態</th><th class="num">天數</th><th class="num">占比</th></tr>
              </thead>
              <tbody>
                <tr v-for="part in segments" :key="part.key">
                  <td>{{ part.label }}</td>
                  <td class="num">{{ part.value }}</td>
                  <td class="num">{{ selected.total > 0 ? Math.round((part.value / selected.total) * 100) : 0 }}%</td>
                </tr>
              </tbody>
            </table>
          </template>
        </ChartCard>

        <ChartCard v-if="!isStudent" title="學員異常排行" :subtitle="`${formatMonthLabel(selectedMonth)}，遲到＋早退＋缺勤次數，最多顯示 8 位`">
          <RankedBarChart v-if="rankedItems.length > 0" :items="rankedItems" unit=" 次" />
          <p v-else class="stats__empty">本月沒有異常紀錄。</p>
          <template #table>
            <table class="chart-table">
              <thead>
                <tr><th>學員</th><th class="num">遲到</th><th class="num">早退</th><th class="num">缺勤</th><th class="num">合計</th></tr>
              </thead>
              <tbody>
                <tr v-for="entry in anomalies" :key="entry.userId">
                  <td>{{ entry.userName }}</td>
                  <td class="num">{{ entry.late }}</td>
                  <td class="num">{{ entry.earlyLeave }}</td>
                  <td class="num">{{ entry.absent }}</td>
                  <td class="num">{{ entry.total }}</td>
                </tr>
              </tbody>
            </table>
          </template>
        </ChartCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.stats__content {
  transition: opacity 0.2s ease;
}

.stats__content.is-refreshing {
  opacity: 0.5;
  pointer-events: none;
}

.stats__kpis {
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stats__hero {
  padding: 18px 22px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.stats__hero-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.stats__hero-value {
  margin-top: 4px;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
}

.stats__hero-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.stats__delta {
  font-weight: 600;
}

.stats__delta.is-up {
  color: var(--color-success);
}

.stats__delta.is-down {
  color: var(--color-danger);
}

.stats__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stats__span {
  grid-column: 1 / -1;
}

.stats__empty {
  padding: 24px 0;
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 1100px) {
  .stats__kpis {
    grid-template-columns: 1fr 1fr;
  }

  .stats__hero {
    grid-column: 1 / -1;
  }
}

@media (max-width: 860px) {
  .stats__grid {
    grid-template-columns: 1fr;
  }

  .stats__hero-value {
    font-size: 40px;
  }
}
</style>
