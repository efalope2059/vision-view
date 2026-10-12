import { useEffect, useState } from 'react'
import { toDayKey } from '../domain/dates.ts'
import type { DayKey } from '../domain/types.ts'

/**
 * Today's day key, kept current. An installed app can sit in the background for days,
 * so re-check whenever it comes back to the foreground, and once a minute while open.
 */
export function useTodayKey(boundaryHour: number): DayKey {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const refresh = () => setNow(new Date())
    const timer = window.setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return toDayKey(now, boundaryHour)
}
