import { toDayKey } from '../domain/dates.ts'
import { makeArea, makeHabit, makeLink } from '../domain/factories.ts'
import type { Store } from './Store.ts'

/**
 * First-run starter data so the Today view isn't empty before the editor exists (M2).
 * Everything here is ordinary data you can rename or archive later.
 * Uses only the Store interface, so it works the same against a future backend.
 */
export async function seedIfEmpty(store: Store, now: Date = new Date()): Promise<void> {
  const snapshot = await store.getSnapshot()
  if (snapshot.areas.length > 0 || snapshot.habits.length > 0) return

  const startDay = toDayKey(now, snapshot.profile.dayBoundaryHour)

  await store.saveProfile({
    ...snapshot.profile,
    vision: 'Placeholder vision: become who I am meant to be, one day at a time.',
  })

  const body = await store.saveArea(makeArea('Body', 0, now))
  const faith = await store.saveArea(makeArea('Faith', 1, now))
  const work = await store.saveArea(makeArea('Work', 2, now))

  const habit = (areaId: string, name: string, order: number, why?: string) =>
    store.saveHabit(makeHabit({ areaId, name, order, why, startDay }, now))

  const sleep = await habit(body.id, 'In bed by 11', 0, 'Tomorrow starts tonight.')
  const workout = await habit(body.id, 'Workout', 1)
  const devotion = await habit(faith.id, 'Morning devotion', 0)
  await habit(work.id, 'Deep work block', 0, 'Creative work needs a clear head.')

  await store.saveLink(makeLink(sleep.id, workout.id, now))
  await store.saveLink(makeLink(sleep.id, devotion.id, now))
}
