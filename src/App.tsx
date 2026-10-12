import { useEffect, useState } from 'react'

// Day 1 only: this counter shows whether Safari and the Home Screen app share storage.
// It is replaced by the real storage module in M1.
const TAP_KEY = 'vv:m0:taps'

function readTaps(): number {
  try {
    return Number(localStorage.getItem(TAP_KEY) ?? 0)
  } catch {
    return 0
  }
}

function App() {
  const [taps, setTaps] = useState(readTaps)
  const storageApi = Boolean(navigator.storage?.persisted)
  const [persisted, setPersisted] = useState(storageApi ? 'checking…' : 'not supported')
  const installed =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true

  useEffect(() => {
    if (!storageApi) return
    navigator.storage.persisted().then((p) => setPersisted(p ? 'yes' : 'no'))
  }, [storageApi])

  function tap() {
    const next = taps + 1
    setTaps(next)
    try {
      localStorage.setItem(TAP_KEY, String(next))
    } catch {
      // Storage unavailable (e.g. private browsing); the count just won't persist.
    }
  }

  return (
    <main>
      <h1>Vision View</h1>
      <p className="vision">Placeholder vision: become who I'm meant to be, one day at a time.</p>
      <hr className="horizon" />

      <section className="diagnostics" aria-label="Diagnostics">
        <h2>Diagnostics</h2>
        <dl>
          <dt>Build</dt>
          <dd>{__BUILD_SHA__}</dd>
          <dt>Running as</dt>
          <dd>{installed ? 'installed app' : 'Safari tab'}</dd>
          <dt>Persistent storage</dt>
          <dd>{persisted}</dd>
          <dt>Taps saved</dt>
          <dd>{taps}</dd>
        </dl>
        <button type="button" onClick={tap}>
          Tap me
        </button>
      </section>
    </main>
  )
}

export default App
