// The data model. These shapes are also the export format (see docs/schema.md, added in M3),
// so change them only by bumping SCHEMA_VERSION and adding a migration.

export const SCHEMA_VERSION = 1

/** A calendar day in the user's local time, formatted YYYY-MM-DD. See dates.ts. */
export type DayKey = string

/** An instant in time, ISO 8601 in UTC, e.g. "2026-10-11T02:15:00.000Z". */
export type Timestamp = string

export interface Profile {
  vision: string
  anchor: { text: string; enabled: boolean }
  /** Check-ins before this local hour count toward the previous day (e.g. 3 = 3 a.m.). */
  dayBoundaryHour: number
  updatedAt: Timestamp
}

export interface Area {
  id: string
  name: string
  /** Sort position on the Today view, ascending. */
  order: number
  color?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  archivedAt?: Timestamp
}

export interface Habit {
  id: string
  areaId: string
  name: string
  /** Optional plain-text reason, surfaced on the Today view. */
  why?: string
  order: number
  /** Only "daily" in v1; the object form leaves room for "3x per week" later. */
  schedule: { type: 'daily' }
  /** First day the habit counts toward stats. */
  startDay: DayKey
  /** First day the habit no longer counts. Absent while active. */
  archivedDay?: DayKey
  createdAt: Timestamp
  updatedAt: Timestamp
}

/** A directed edge: completing `fromHabitId` feeds `toHabitId`. */
export interface Link {
  id: string
  fromHabitId: string
  toHabitId: string
  kind: 'feeds'
  note?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Checkin {
  /** Deterministic: `${habitId}:${dayKey}`, so saving the same day twice can't duplicate. */
  id: string
  habitId: string
  dayKey: DayKey
  /** Unchecking sets false rather than deleting, which keeps future sync simple. */
  done: boolean
  /** IANA timezone at the moment of the tap, e.g. "America/Chicago". */
  tz: string
  updatedAt: Timestamp
}

/** Everything the app knows. Small enough to load in one go. */
export interface Snapshot {
  profile: Profile
  areas: Area[]
  habits: Habit[]
  links: Link[]
  checkins: Checkin[]
}
