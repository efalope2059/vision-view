import { useEffect, useState } from 'react'
import { Diagnostics } from './components/Diagnostics.tsx'
import { DEFAULT_DAY_BOUNDARY_HOUR } from './domain/dates.ts'
import type { Snapshot } from './domain/types.ts'
import { useTodayKey } from './hooks/useTodayKey.ts'
import { store } from './storage/index.ts'
import { upsert } from './storage/localStore.ts'
import { seedIfEmpty } from './storage/seed.ts'
import { TodayView } from './views/TodayView.tsx'

// Load once per page load. (React's dev mode runs effects twice; this stops a double seed.)
let loading: Promise<Snapshot> | null = null
function loadOnce(): Promise<Snapshot> {
  loading ??= seedIfEmpty(store).then(() => store.getSnapshot())
  return loading
}

function App() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const day = useTodayKey(snapshot?.profile.dayBoundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR)

  useEffect(() => {
    loadOnce()
      .then(setSnapshot)
      .catch((e: Error) => setError(e.message))
  }, [])

  async function toggle(habitId: string, done: boolean) {
    try {
      const saved = await store.setCheckin(habitId, day, done)
      setSnapshot((s) => s && { ...s, checkins: upsert(s.checkins, saved) })
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <>
      {error && (
        <p className="error" role="alert">
          Something went wrong: {error}
        </p>
      )}
      {snapshot && <TodayView snapshot={snapshot} day={day} onToggle={toggle} />}
      <Diagnostics />
    </>
  )
}

export default App
