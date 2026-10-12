import { describe, expect, it } from 'vitest'
import { defaultProfile, makeArea, makeHabit } from './factories.ts'
import { buildToday, isHabitActiveOn } from './today.ts'
import type { Checkin, Snapshot } from './types.ts'

const body = makeArea('Body', 1)
const work = makeArea('Work', 0)
const faith = { ...makeArea('Faith', 2), archivedAt: '2026-10-01T00:00:00.000Z' }

const workout = makeHabit({ areaId: body.id, name: 'Workout', order: 1, startDay: '2026-10-01' })
const sleep = makeHabit({ areaId: body.id, name: 'In bed by 11', order: 0, startDay: '2026-10-01' })
const deepWork = makeHabit({ areaId: work.id, name: 'Deep work', order: 0, startDay: '2026-10-11' })
const devotion = makeHabit({ areaId: faith.id, name: 'Devotion', order: 0, startDay: '2026-10-01' })

function checkin(habitId: string, dayKey: string, done: boolean): Checkin {
  return { id: `${habitId}:${dayKey}`, habitId, dayKey, done, tz: 'America/Chicago', updatedAt: '' }
}

const snapshot: Snapshot = {
  profile: defaultProfile(),
  areas: [body, work, faith],
  habits: [workout, sleep, deepWork, devotion],
  links: [],
  checkins: [
    checkin(sleep.id, '2026-10-10', true),
    checkin(workout.id, '2026-10-10', true),
    checkin(workout.id, '2026-10-10', true),
    checkin(sleep.id, '2026-10-09', false),
  ],
}

describe('isHabitActiveOn', () => {
  it('starts on startDay and stops on archivedDay', () => {
    const h = { ...workout, startDay: '2026-10-05', archivedDay: '2026-10-08' }
    expect(isHabitActiveOn(h, '2026-10-04')).toBe(false)
    expect(isHabitActiveOn(h, '2026-10-05')).toBe(true)
    expect(isHabitActiveOn(h, '2026-10-07')).toBe(true)
    expect(isHabitActiveOn(h, '2026-10-08')).toBe(false)
  })
})

describe('buildToday', () => {
  it('groups active habits by area in display order and marks done', () => {
    const groups = buildToday(snapshot, '2026-10-10')
    // Work has no habits active on the 10th yet, and Faith is archived, so only Body shows.
    expect(groups.map((g) => g.area.name)).toEqual(['Body'])
    expect(groups[0].rows.map((r) => [r.habit.name, r.done])).toEqual([
      ['In bed by 11', true],
      ['Workout', true],
    ])
  })

  it('shows habits from their start day and ignores other days check-ins', () => {
    const groups = buildToday(snapshot, '2026-10-11')
    expect(groups.map((g) => g.area.name)).toEqual(['Work', 'Body'])
    expect(groups.flatMap((g) => g.rows).every((r) => !r.done)).toBe(true)
  })
})
