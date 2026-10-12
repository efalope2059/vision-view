import { describe, expect, it } from 'vitest'
import {
  archiveArea,
  archiveHabit,
  cleanName,
  cleanText,
  MAX_NAME_LENGTH,
  nextOrder,
  restoreArea,
  restoreHabit,
} from './edit.ts'
import { defaultProfile, makeArea, makeHabit } from './factories.ts'
import { buildToday } from './today.ts'
import type { Snapshot } from './types.ts'

describe('cleanName / cleanText', () => {
  it('trims, collapses spaces, and rejects blanks', () => {
    expect(cleanName('  In   bed by 11 ')).toBe('In bed by 11')
    expect(cleanName('   ')).toBeNull()
    expect(cleanName('x'.repeat(100))).toHaveLength(MAX_NAME_LENGTH)
  })

  it('turns blank text into undefined but keeps line breaks', () => {
    expect(cleanText('  ')).toBeUndefined()
    expect(cleanText(' line one\nline two ')).toBe('line one\nline two')
  })
})

describe('nextOrder', () => {
  it('places new items after existing ones', () => {
    expect(nextOrder([])).toBe(0)
    expect(nextOrder([{ order: 0 }, { order: 4 }, { order: 2 }])).toBe(5)
  })
})

describe('archiving', () => {
  const body = makeArea('Body', 0)
  const work = makeArea('Work', 1)
  const sleep = makeHabit({ areaId: body.id, name: 'Sleep', order: 0, startDay: '2026-10-01' })
  const gym = makeHabit({ areaId: body.id, name: 'Gym', order: 1, startDay: '2026-10-01' })
  const oldHabit = archiveHabit(
    makeHabit({ areaId: body.id, name: 'Old', order: 2, startDay: '2026-09-01' }),
    '2026-09-15',
  )
  const deepWork = makeHabit({ areaId: work.id, name: 'Deep', order: 0, startDay: '2026-10-01' })
  const snapshot: Snapshot = {
    profile: defaultProfile(),
    areas: [body, work],
    habits: [sleep, gym, oldHabit, deepWork],
    links: [],
    checkins: [],
  }

  it('removes an archived habit from Today from that day on', () => {
    const archived = archiveHabit(gym, '2026-10-11')
    const s = { ...snapshot, habits: [sleep, archived] }
    expect(buildToday(s, '2026-10-10')[0].rows).toHaveLength(2)
    expect(buildToday(s, '2026-10-11')[0].rows).toHaveLength(1)
    expect(buildToday({ ...s, habits: [sleep, restoreHabit(archived)] }, '2026-10-11')[0].rows).toHaveLength(2)
  })

  it('archives an area together with its active habits only', () => {
    const { area, habits } = archiveArea(snapshot, body.id, '2026-10-11', new Date('2026-10-11T12:00:00Z'))
    expect(area.archivedAt).toBe('2026-10-11T12:00:00.000Z')
    expect(habits.map((h) => h.name)).toEqual(['Sleep', 'Gym'])
    expect(habits.every((h) => h.archivedDay === '2026-10-11')).toBe(true)
    expect(restoreArea(area).archivedAt).toBeUndefined()
  })
})
