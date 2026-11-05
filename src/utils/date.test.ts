import { describe, expect, it } from 'vitest'
import {
  addMonths,
  eachDateKey,
  formatDateLabel,
  formatMonthLabel,
  formatMonthShort,
  monthGridDays,
  parseDateKey,
  recentMonthKeys,
  timeToMinutes,
  toDateKey,
  toMonthKey,
  toTimeString,
} from './date'

describe('date 工具', () => {
  it('toDateKey / parseDateKey 可互相轉換', () => {
    const date = new Date(2024, 0, 5)
    expect(toDateKey(date)).toBe('2024-01-05')
    expect(parseDateKey('2024-01-05').getTime()).toBe(date.getTime())
  })

  it('toMonthKey 與 toTimeString 會補零', () => {
    const date = new Date(2024, 2, 7, 9, 5)
    expect(toMonthKey(date)).toBe('2024-03')
    expect(toTimeString(date)).toBe('09:05')
  })

  it('formatDateLabel 顯示月日與中文星期', () => {
    // 2024-01-01 是星期一
    expect(formatDateLabel('2024-01-01')).toBe('01/01（一）')
    expect(formatDateLabel('2024-01-07')).toBe('01/07（日）')
  })

  it('月份標籤格式', () => {
    expect(formatMonthLabel('2024-03')).toBe('2024 年 3 月')
    expect(formatMonthShort('2024-11')).toBe('11 月')
  })

  it('timeToMinutes 轉成分鐘數', () => {
    expect(timeToMinutes('09:00')).toBe(540)
    expect(timeToMinutes('18:30')).toBe(1110)
  })

  it('addMonths 跨年正確', () => {
    expect(addMonths('2024-12', 1)).toBe('2025-01')
    expect(addMonths('2024-01', -1)).toBe('2023-12')
    expect(addMonths('2024-05', 0)).toBe('2024-05')
  })

  it('eachDateKey 含起訖日並處理閏年', () => {
    expect(eachDateKey('2024-02-28', '2024-03-01')).toEqual(['2024-02-28', '2024-02-29', '2024-03-01'])
    expect(eachDateKey('2024-05-01', '2024-05-01')).toEqual(['2024-05-01'])
  })

  it('monthGridDays 從星期日開始且整週對齊', () => {
    // 2024-02-01 是星期四，二月有 29 天 → 需要 5 列
    const grid = monthGridDays('2024-02')
    expect(grid.length % 7).toBe(0)
    expect(grid).toHaveLength(35)
    expect(grid[0]).toBe('2024-01-28')
    expect(parseDateKey(grid[0] as string).getDay()).toBe(0)
    expect(grid).toContain('2024-02-01')
    expect(grid).toContain('2024-02-29')
    expect(grid[grid.length - 1]).toBe('2024-03-02')
  })

  it('recentMonthKeys 由新到舊', () => {
    expect(recentMonthKeys(3, new Date(2024, 0, 15))).toEqual(['2024-01', '2023-12', '2023-11'])
  })
})
