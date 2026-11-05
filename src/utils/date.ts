/**
 * 日期工具：專案不引入 dayjs 等套件，用原生 Date 處理即可。
 * 日期一律以字串 'YYYY-MM-DD' 傳遞，時間以 'HH:mm' 傳遞，方便比較與顯示。
 */

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Date → 'YYYY-MM-DD' */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Date → 'YYYY-MM' */
export function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

/** Date → 'HH:mm' */
export function toTimeString(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** 'YYYY-MM-DD' → Date（本地時區） */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

/** 'YYYY-MM-DD' → '11/05（三）' */
export function formatDateLabel(key: string): string {
  const date = parseDateKey(key)
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}（${WEEKDAY_LABELS[date.getDay()]}）`
}

/** 'YYYY-MM' → '2026 年 11 月' */
export function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-')
  return `${year} 年 ${Number(month)} 月`
}

/** 'YYYY-MM' → '11 月'，用於圖表 X 軸 */
export function formatMonthShort(key: string): string {
  const [, month] = key.split('-')
  return `${Number(month)} 月`
}

/** 'HH:mm' → 分鐘數，方便比較早晚 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/** 'YYYY-MM' 往前或往後移動 n 個月 */
export function addMonths(key: string, delta: number): string {
  const [year, month] = key.split('-').map(Number)
  return toMonthKey(new Date(year ?? 1970, (month ?? 1) - 1 + delta, 1))
}

/** 起訖日（含）之間的每一天 'YYYY-MM-DD' */
export function eachDateKey(start: string, end: string): string[] {
  const keys: string[] = []
  const cursor = parseDateKey(start)
  const last = parseDateKey(end)
  while (cursor <= last) {
    keys.push(toDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return keys
}

/**
 * 月曆格：從該月 1 號所在週的星期日開始，回傳整週對齊的日期（每列 7 天），
 * 會包含上個月尾與下個月初補滿的日子。
 */
export function monthGridDays(key: string): string[] {
  const [year, month] = key.split('-').map(Number)
  const first = new Date(year ?? 1970, (month ?? 1) - 1, 1)
  const daysInMonth = new Date(year ?? 1970, month ?? 1, 0).getDate()
  const leading = first.getDay()
  const rows = Math.ceil((leading + daysInMonth) / 7)
  const start = new Date(first)
  start.setDate(first.getDate() - leading)

  return Array.from({ length: rows * 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return toDateKey(date)
  })
}

/** 取得最近 n 個月的 'YYYY-MM'，由新到舊 */
export function recentMonthKeys(count: number, from: Date = new Date()): string[] {
  const keys: string[] = []
  for (let i = 0; i < count; i += 1) {
    keys.push(toMonthKey(new Date(from.getFullYear(), from.getMonth() - i, 1)))
  }
  return keys
}
