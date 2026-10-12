import type { Area, DayKey, Habit, Snapshot } from './types.ts'

// Rules for editing areas and habits. Pure functions: they return the records to save,
// and the caller saves them through the Store.

export const MAX_NAME_LENGTH = 60
export const MAX_TEXT_LENGTH = 500

/** Trimmed, single-spaced name, or null if blank. */
export function cleanName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, ' ')
  return name ? name.slice(0, MAX_NAME_LENGTH) : null
}

/** Trimmed free text, or undefined if blank (so it's left out of the saved record). */
export function cleanText(raw: string): string | undefined {
  const text = raw.trim()
  return text ? text.slice(0, MAX_TEXT_LENGTH) : undefined
}

/** Sort position for a new item placed after `items`. */
export function nextOrder(items: { order: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.order), -1) + 1
}

/** A habit stops counting from `day` on (it leaves Today immediately). History is kept. */
export function archiveHabit(habit: Habit, day: DayKey): Habit {
  return { ...habit, archivedDay: day }
}

/** Brings a habit back. Days between archive and restore count as not done. */
export function restoreHabit(habit: Habit): Habit {
  return { ...habit, archivedDay: undefined }
}

/**
 * Archiving an area also archives its active habits. Otherwise they'd vanish from Today
 * but still count as missed in the weekly review.
 */
export function archiveArea(
  snapshot: Snapshot,
  areaId: string,
  day: DayKey,
  now: Date = new Date(),
): { area: Area; habits: Habit[] } {
  const area = snapshot.areas.find((a) => a.id === areaId)
  if (!area) throw new Error(`Area ${areaId} not found`)
  const habits = snapshot.habits
    .filter((h) => h.areaId === areaId && h.archivedDay === undefined)
    .map((h) => archiveHabit(h, day))
  return { area: { ...area, archivedAt: now.toISOString() }, habits }
}

/** Brings an area back. Its habits stay archived; restore the ones you want individually. */
export function restoreArea(area: Area): Area {
  return { ...area, archivedAt: undefined }
}
