import { beforeEach, describe, expect, it } from 'vitest'
import { makeArea, makeHabit, makeLink } from '../domain/factories.ts'
import { LocalStore, STORAGE_KEY, StorageCorruptError, type KeyValueStorage } from './localStore.ts'

function memoryStorage(): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  }
}

const fixedNow = () => new Date('2026-10-11T14:00:00.000Z')

describe('LocalStore', () => {
  let storage: ReturnType<typeof memoryStorage>
  let store: LocalStore

  beforeEach(() => {
    storage = memoryStorage()
    store = new LocalStore(storage, fixedNow)
  })

  it('returns an empty snapshot before anything is saved', async () => {
    const s = await store.getSnapshot()
    expect(s.areas).toEqual([])
    expect(s.profile.dayBoundaryHour).toBe(3)
  })

  it('saves and updates records by id, stamping updatedAt', async () => {
    const area = makeArea('Body', 0, new Date('2026-01-01T00:00:00Z'))
    await store.saveArea(area)
    await store.saveArea({ ...area, name: 'Health' })

    const { areas } = await store.getSnapshot()
    expect(areas).toHaveLength(1)
    expect(areas[0].name).toBe('Health')
    expect(areas[0].updatedAt).toBe('2026-10-11T14:00:00.000Z')
  })

  it('keeps one check-in per habit per day, toggling done', async () => {
    const habit = makeHabit({ areaId: 'a', name: 'Workout', order: 0, startDay: '2026-10-11' })
    await store.saveHabit(habit)
    await store.setCheckin(habit.id, '2026-10-11', true)
    await store.setCheckin(habit.id, '2026-10-11', false)
    await store.setCheckin(habit.id, '2026-10-11', true)

    const { checkins } = await store.getSnapshot()
    expect(checkins).toHaveLength(1)
    expect(checkins[0]).toMatchObject({ id: `${habit.id}:2026-10-11`, done: true })
  })

  it('saves and deletes links', async () => {
    const link = makeLink('h1', 'h2')
    await store.saveLink(link)
    expect((await store.getSnapshot()).links).toHaveLength(1)
    await store.deleteLink(link.id)
    expect((await store.getSnapshot()).links).toHaveLength(0)
  })

  it('persists across instances, versioned under one namespaced key', async () => {
    await store.saveArea(makeArea('Work', 0))
    const reopened = new LocalStore(storage, fixedNow)
    expect((await reopened.getSnapshot()).areas[0].name).toBe('Work')
    expect(JSON.parse(storage.data.get(STORAGE_KEY)!).schemaVersion).toBe(1)
  })

  it('refuses to overwrite data it cannot parse', async () => {
    storage.data.set(STORAGE_KEY, '{not json')
    await expect(store.getSnapshot()).rejects.toBeInstanceOf(StorageCorruptError)
    await expect(store.saveArea(makeArea('Body', 0))).rejects.toBeInstanceOf(StorageCorruptError)
    expect(storage.data.get(STORAGE_KEY)).toBe('{not json')
  })
})
