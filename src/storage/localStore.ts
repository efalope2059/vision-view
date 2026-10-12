import { currentTimeZone } from '../domain/dates.ts'
import { checkinId, defaultProfile } from '../domain/factories.ts'
import type { Area, Checkin, DayKey, Habit, Link, Profile, Snapshot } from '../domain/types.ts'
import { SCHEMA_VERSION } from '../domain/types.ts'
import type { Store } from './Store.ts'

/** The slice of the browser's Storage API we use, so tests can pass an in-memory fake. */
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>

/** Namespaced: every github.io project of yours shares one origin, and so one localStorage. */
export const STORAGE_KEY = 'vv:v1:data'

interface StoredDoc {
  schemaVersion: number
  data: Snapshot
}

export class StorageCorruptError extends Error {}

/**
 * Keeps the whole Snapshot as one JSON document under one key. Each write reads the
 * document, changes one record, and writes it back. That's fine at this size
 * (a year of daily check-ins for 10 habits is well under 1 MB).
 */
export class LocalStore implements Store {
  private readonly storage: KeyValueStorage
  private readonly now: () => Date

  constructor(storage: KeyValueStorage, now: () => Date = () => new Date()) {
    this.storage = storage
    this.now = now
  }

  async getSnapshot(): Promise<Snapshot> {
    return this.read()
  }

  async saveProfile(profile: Profile): Promise<Profile> {
    const saved = { ...profile, updatedAt: this.timestamp() }
    this.update((s) => ({ ...s, profile: saved }))
    return saved
  }

  async saveArea(area: Area): Promise<Area> {
    const saved = { ...area, updatedAt: this.timestamp() }
    this.update((s) => ({ ...s, areas: upsert(s.areas, saved) }))
    return saved
  }

  async saveHabit(habit: Habit): Promise<Habit> {
    const saved = { ...habit, updatedAt: this.timestamp() }
    this.update((s) => ({ ...s, habits: upsert(s.habits, saved) }))
    return saved
  }

  async saveLink(link: Link): Promise<Link> {
    const saved = { ...link, updatedAt: this.timestamp() }
    this.update((s) => ({ ...s, links: upsert(s.links, saved) }))
    return saved
  }

  async deleteLink(id: string): Promise<void> {
    this.update((s) => ({ ...s, links: s.links.filter((l) => l.id !== id) }))
  }

  async setCheckin(habitId: string, dayKey: DayKey, done: boolean): Promise<Checkin> {
    const saved: Checkin = {
      id: checkinId(habitId, dayKey),
      habitId,
      dayKey,
      done,
      tz: currentTimeZone(),
      updatedAt: this.timestamp(),
    }
    this.update((s) => ({ ...s, checkins: upsert(s.checkins, saved) }))
    return saved
  }

  private read(): Snapshot {
    const raw = this.storage.getItem(STORAGE_KEY)
    if (raw === null) return emptySnapshot(this.now())
    try {
      const doc = JSON.parse(raw) as StoredDoc
      return doc.data
    } catch {
      // Never overwrite data we can't read; the user may still be able to recover it.
      throw new StorageCorruptError(`Saved data under "${STORAGE_KEY}" could not be read.`)
    }
  }

  private update(change: (s: Snapshot) => Snapshot): void {
    const doc: StoredDoc = { schemaVersion: SCHEMA_VERSION, data: change(this.read()) }
    this.storage.setItem(STORAGE_KEY, JSON.stringify(doc))
  }

  private timestamp(): string {
    return this.now().toISOString()
  }
}

export function emptySnapshot(now: Date = new Date()): Snapshot {
  return { profile: defaultProfile(now), areas: [], habits: [], links: [], checkins: [] }
}

/** Replaces the record with the same id, or appends it. Exported for the UI's optimistic updates. */
export function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const i = list.findIndex((x) => x.id === item.id)
  return i === -1 ? [...list, item] : list.map((x, j) => (j === i ? item : x))
}
