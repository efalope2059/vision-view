import { useEffect, useState } from 'react'

const storageApi = Boolean(navigator.storage?.persisted)

/** Build and storage facts for checking the installed app on a phone. Moves to Settings in M2. */
export function Diagnostics() {
  const [persisted, setPersisted] = useState(storageApi ? 'checking…' : 'not supported')
  const installed =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true

  useEffect(() => {
    if (!storageApi) return
    navigator.storage.persisted().then((p) => setPersisted(p ? 'yes' : 'no'))
  }, [])

  return (
    <details className="diagnostics">
      <summary>Diagnostics</summary>
      <dl>
        <dt>Build</dt>
        <dd>{__BUILD_SHA__}</dd>
        <dt>Running as</dt>
        <dd>{installed ? 'installed app' : 'Safari tab'}</dd>
        <dt>Persistent storage</dt>
        <dd>{persisted}</dd>
      </dl>
    </details>
  )
}
