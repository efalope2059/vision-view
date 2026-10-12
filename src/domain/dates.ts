import type { DayKey } from './types.ts'

// Day keys are plain "YYYY-MM-DD" strings in the user's local calendar.
// Rule: compute a day key once, at the moment of the tap, from local wall-clock time.
// After that, do all day arithmetic on the strings (via UTC internally), never by adding
// 86,400,000 ms to a timestamp: that breaks on daylight-saving days.

export const DEFAULT_DAY_BOUNDARY_HOUR = 3

/** The day an instant belongs to. Before `boundaryHour` (local), it still counts as yesterday. */
export function toDayKey(at: Date, boundaryHour: number = DEFAULT_DAY_BOUNDARY_HOUR): DayKey {
  const daysBack = at.getHours() < boundaryHour ? 1 : 0
  // The Date constructor normalises "day 0" to the last day of the previous month.
  const local = new Date(at.getFullYear(), at.getMonth(), at.getDate() - daysBack)
  return format(local.getFullYear(), local.getMonth() + 1, local.getDate())
}

export function addDays(day: DayKey, n: number): DayKey {
  const d = new Date(toUtcMs(day) + n * MS_PER_DAY)
  return format(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())
}

/** Whole days from `a` to `b` (positive when b is later). */
export function daysBetween(a: DayKey, b: DayKey): number {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / MS_PER_DAY)
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(day: DayKey): number {
  return new Date(toUtcMs(day)).getUTCDay()
}

/** Human label for a day key, e.g. "Sunday, October 11". */
export function formatDayLabel(day: DayKey, locale?: string): string {
  return new Date(toUtcMs(day)).toLocaleDateString(locale, {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/** The device's IANA timezone, e.g. "America/Chicago". */
export function currentTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

const MS_PER_DAY = 86_400_000

function toUtcMs(day: DayKey): number {
  const [y, m, d] = day.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function format(y: number, m: number, d: number): DayKey {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
