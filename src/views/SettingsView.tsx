import { useState, type FormEvent } from 'react'
import { Diagnostics } from '../components/Diagnostics.tsx'
import { cleanText, MAX_TEXT_LENGTH } from '../domain/edit.ts'
import type { Snapshot } from '../domain/types.ts'
import type { AppActions } from '../hooks/useAppData.ts'
import { navigate } from '../hooks/useHashRoute.ts'

interface Props {
  snapshot: Snapshot
  actions: AppActions
}

export function SettingsView({ snapshot, actions }: Props) {
  const { profile } = snapshot
  const [vision, setVision] = useState(profile.vision)
  const [anchorText, setAnchorText] = useState(profile.anchor.text)
  const [anchorOn, setAnchorOn] = useState(profile.anchor.enabled)
  const [saved, setSaved] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const ok = await actions.saveProfile({
      ...profile,
      vision: cleanText(vision) ?? '',
      anchor: { text: cleanText(anchorText) ?? '', enabled: anchorOn },
    })
    setSaved(ok)
  }

  async function reset() {
    const ok = window.confirm(
      'Erase everything on this device: vision, areas, habits, and every check-in? This cannot be undone.',
    )
    if (ok && (await actions.resetAll())) navigate('/')
  }

  return (
    <main>
      <h1 className="page-title">Settings</h1>

      <form onSubmit={submit} className="form" onChange={() => setSaved(false)}>
        <label className="field">
          <span>Vision</span>
          <textarea
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            maxLength={MAX_TEXT_LENGTH}
            rows={4}
            placeholder="Who are you becoming? This sits above your habits every day."
          />
        </label>

        <label className="field">
          <span>Anchor (optional)</span>
          <textarea
            value={anchorText}
            onChange={(e) => setAnchorText(e.target.value)}
            maxLength={MAX_TEXT_LENGTH}
            rows={3}
            placeholder="A quote, a personal reason, or a verse that steadies you."
          />
        </label>

        <label className="toggle">
          <input type="checkbox" checked={anchorOn} onChange={(e) => setAnchorOn(e.target.checked)} />
          <span>Show the anchor on Today</span>
        </label>

        <div className="form-actions">
          <button type="submit" className="primary">
            Save
          </button>
          {saved && <span role="status">Saved</span>}
        </div>
      </form>

      <Diagnostics />

      <div className="danger-zone">
        <p className="hint">
          Erases all data on this device. Export arrives in the next update, so there's no backup
          yet.
        </p>
        <button type="button" onClick={reset}>
          Erase all data
        </button>
      </div>
    </main>
  )
}
