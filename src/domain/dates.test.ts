import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, toDayKey, weekday } from './dates.ts'

// Tests run with TZ=America/Chicago (see vite.config.ts) so DST dates are real.
// Instants are written with explicit offsets so they're unambiguous.

describe('toDayKey', () => {
  it('counts a 1:30 a.m. tap toward the previous day', () => {
    expect(toDayKey(new Date('2026-10-11T01:30:00-05:00'))).toBe('2026-10-10')
  })

  it('switches to the new day at the boundary hour', () => {
    expect(toDayKey(new Date('2026-10-11T02:59:00-05:00'))).toBe('2026-10-10')
    expect(toDayKey(new Date('2026-10-11T03:00:00-05:00'))).toBe('2026-10-11')
  })

  it('uses plain midnight when the boundary is 0', () => {
    expect(toDayKey(new Date('2026-10-11T00:10:00-05:00'), 0)).toBe('2026-10-11')
  })

  it('rolls back across month and year ends', () => {
    expect(toDayKey(new Date('2026-01-01T01:00:00-06:00'))).toBe('2025-12-31')
    expect(toDayKey(new Date('2026-03-01T02:00:00-06:00'))).toBe('2026-02-28')
  })

  it('handles the fall-back DST night (01:30 happens twice)', () => {
    expect(toDayKey(new Date('2026-11-01T01:30:00-05:00'))).toBe('2026-10-31') // CDT
    expect(toDayKey(new Date('2026-11-01T01:30:00-06:00'))).toBe('2026-10-31') // CST
    expect(toDayKey(new Date('2026-11-01T03:30:00-06:00'))).toBe('2026-11-01')
  })

  it('handles the spring-forward DST night (02:00-03:00 never happens)', () => {
    expect(toDayKey(new Date('2026-03-08T01:59:00-06:00'))).toBe('2026-03-07')
    expect(toDayKey(new Date('2026-03-08T03:00:00-05:00'))).toBe('2026-03-08')
  })
})

describe('day arithmetic', () => {
  it('adds days across DST changes without skipping or repeating', () => {
    expect(addDays('2026-03-07', 1)).toBe('2026-03-08')
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09')
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-11-01', 1)).toBe('2026-11-02')
  })

  it('adds days across month and year ends, and backwards', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDays('2028-03-01', -1)).toBe('2028-02-29')
  })

  it('counts whole days between keys', () => {
    expect(daysBetween('2026-03-01', '2026-04-01')).toBe(31)
    expect(daysBetween('2026-10-25', '2026-11-08')).toBe(14)
    expect(daysBetween('2026-10-11', '2026-10-10')).toBe(-1)
  })

  it('knows the weekday', () => {
    expect(weekday('2026-10-11')).toBe(0) // Sunday
    expect(weekday('2026-10-17')).toBe(6) // Saturday
  })
})
