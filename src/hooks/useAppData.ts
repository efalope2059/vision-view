import { useEffect, useState } from 'react'
import { archiveArea as archiveAreaChanges } from '../domain/edit.ts'
import type { Area, DayKey, Habit, Profile, Snapshot } from '../domain/types.ts'
import { store } from '../storage/index.ts'
import { upsert } from '../storage/localStore.ts'

/** Everything a screen can change. Each returns true on success. */
export interface AppActions {
  toggleCheckin(habitId: string, day: DayKey, done: boolean): Promise<boolean>
  saveProfile(profile: Profile): Promise<boolean>
  saveArea(area: Area): Promise<boolean>
  saveHabit(habit: Habit): Promise<boolean>
  archiveArea(areaId: string, day: DayKey): Promise<boolean>
  resetAll(): Promise<boolean>
}

/**
 * Holds the in-memory Snapshot and keeps it in step with the Store: each action writes
 * through the Store first, then updates what's on screen with the saved record.
 */
export function useAppData() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    store
      .getSnapshot()
      .then(setSnapshot)
      .catch((e: Error) => setError(e.message))
  }, [])

  /** Runs a write; on failure shows the error and returns false. */
  async function run(write: () => Promise<(s: Snapshot) => Snapshot>): Promise<boolean> {
    try {
      const apply = await write()
      setSnapshot((s) => s && apply(s))
      setError(null)
      return true
    } catch (e) {
      setError((e as Error).message)
      return false
    }
  }

  const actions: AppActions = {
    toggleCheckin: (habitId, day, done) =>
      run(async () => {
        const saved = await store.setCheckin(habitId, day, done)
        return (s) => ({ ...s, checkins: upsert(s.checkins, saved) })
      }),

    saveProfile: (profile) =>
      run(async () => {
        const saved = await store.saveProfile(profile)
        return (s) => ({ ...s, profile: saved })
      }),

    saveArea: (area) =>
      run(async () => {
        const saved = await store.saveArea(area)
        return (s) => ({ ...s, areas: upsert(s.areas, saved) })
      }),

    saveHabit: (habit) =>
      run(async () => {
        const saved = await store.saveHabit(habit)
        return (s) => ({ ...s, habits: upsert(s.habits, saved) })
      }),

    archiveArea: (areaId, day) =>
      run(async () => {
        const current = await store.getSnapshot()
        const changes = archiveAreaChanges(current, areaId, day)
        const habits: Habit[] = []
        for (const habit of changes.habits) habits.push(await store.saveHabit(habit))
        const area = await store.saveArea(changes.area)
        return (s) => ({
          ...s,
          areas: upsert(s.areas, area),
          habits: habits.reduce((list, h) => upsert(list, h), s.habits),
        })
      }),

    resetAll: () =>
      run(async () => {
        await store.resetAll()
        const fresh = await store.getSnapshot()
        return () => fresh
      }),
  }

  return { snapshot, error, actions }
}
