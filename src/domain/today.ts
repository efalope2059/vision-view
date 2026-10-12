import type { Area, DayKey, Habit, Snapshot } from './types.ts'

export interface TodayRow {
  habit: Habit
  done: boolean
}

export interface TodayGroup {
  area: Area
  rows: TodayRow[]
}

/** Whether a habit counts on a given day (exists by then and isn't archived yet). */
export function isHabitActiveOn(habit: Habit, day: DayKey): boolean {
  // Day keys sort correctly as strings.
  return habit.startDay <= day && (habit.archivedDay === undefined || day < habit.archivedDay)
}

/** The Today checklist: active habits grouped by area, both in display order. Empty areas are left out. */
export function buildToday(snapshot: Snapshot, day: DayKey): TodayGroup[] {
  const doneIds = new Set(
    snapshot.checkins.filter((c) => c.dayKey === day && c.done).map((c) => c.habitId),
  )

  return snapshot.areas
    .filter((area) => area.archivedAt === undefined)
    .sort(byOrder)
    .map((area) => ({
      area,
      rows: snapshot.habits
        .filter((h) => h.areaId === area.id && isHabitActiveOn(h, day))
        .sort(byOrder)
        .map((habit) => ({ habit, done: doneIds.has(habit.id) })),
    }))
    .filter((group) => group.rows.length > 0)
}

/** Display order: by `order`, then by name. */
export function byOrder(a: { order: number; name: string }, b: { order: number; name: string }): number {
  return a.order - b.order || a.name.localeCompare(b.name)
}
