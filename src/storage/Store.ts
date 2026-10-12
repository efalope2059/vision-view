import type { Area, Checkin, DayKey, Habit, Link, Profile, Snapshot } from '../domain/types.ts'

/**
 * Every read and write the app makes goes through this interface. The UI never touches
 * localStorage directly.
 *
 * Today: LocalStore (localStore.ts). Later: an ApiStore that calls API Gateway + Lambda,
 * written as a second implementation of this same interface (see apiStore.ts).
 *
 * Every method is async even though localStorage is synchronous, so swapping in a
 * network-backed store won't change any calling code.
 *
 * Archiving is a save with `archivedAt` / `archivedDay` set. Records are never hard-deleted,
 * except links, which carry no history.
 */
export interface Store {
  getSnapshot(): Promise<Snapshot>

  saveProfile(profile: Profile): Promise<Profile>
  saveArea(area: Area): Promise<Area>
  saveHabit(habit: Habit): Promise<Habit>
  saveLink(link: Link): Promise<Link>
  deleteLink(id: string): Promise<void>

  /** Idempotent: one record per habit per day, created or updated. */
  setCheckin(habitId: string, dayKey: DayKey, done: boolean): Promise<Checkin>

  /** Erases everything. The app starts empty afterwards. */
  resetAll(): Promise<void>

  // M3 adds: exportAll(), importAll(doc, mode)
}
