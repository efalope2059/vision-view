import { DEFAULT_DAY_BOUNDARY_HOUR } from './dates.ts'
import type { Area, DayKey, Habit, Link, Profile } from './types.ts'

// Builders for new records. IDs are generated on the device so the app works offline,
// and a future backend can accept them unchanged.

export function newId(): string {
  return crypto.randomUUID()
}

export function checkinId(habitId: string, dayKey: DayKey): string {
  return `${habitId}:${dayKey}`
}

export function defaultProfile(now: Date = new Date()): Profile {
  return {
    vision: '',
    anchor: { text: '', enabled: false },
    dayBoundaryHour: DEFAULT_DAY_BOUNDARY_HOUR,
    updatedAt: now.toISOString(),
  }
}

export function makeArea(name: string, order: number, now: Date = new Date()): Area {
  const ts = now.toISOString()
  return { id: newId(), name, order, createdAt: ts, updatedAt: ts }
}

export function makeHabit(
  fields: { areaId: string; name: string; why?: string; order: number; startDay: DayKey },
  now: Date = new Date(),
): Habit {
  const ts = now.toISOString()
  return { id: newId(), schedule: { type: 'daily' }, createdAt: ts, updatedAt: ts, ...fields }
}

export function makeLink(fromHabitId: string, toHabitId: string, now: Date = new Date()): Link {
  const ts = now.toISOString()
  return { id: newId(), fromHabitId, toHabitId, kind: 'feeds', createdAt: ts, updatedAt: ts }
}
