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

/** 'HH:mm' → 分鐘數，方便比較早晚 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/** 取得最近 n 個月的 'YYYY-MM'，由新到舊 */
export function recentMonthKeys(count: number, from: Date = new Date()): string[] {
  const keys: string[] = []
  for (let i = 0; i < count; i += 1) {
    keys.push(toMonthKey(new Date(from.getFullYear(), from.getMonth() - i, 1)))
  }
  return keys
}
