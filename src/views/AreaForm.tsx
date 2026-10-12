import { useState, type FormEvent } from 'react'
import { cleanName, MAX_NAME_LENGTH, nextOrder } from '../domain/edit.ts'
import { makeArea } from '../domain/factories.ts'
import type { DayKey, Snapshot } from '../domain/types.ts'
import type { AppActions } from '../hooks/useAppData.ts'
import { navigate } from '../hooks/useHashRoute.ts'
import { BackLink, Missing } from './HabitForm.tsx'

interface Props {
  snapshot: Snapshot
  /** null when creating a new area. */
  areaId: string | null
  today: DayKey
  actions: AppActions
}

export function AreaForm({ snapshot, areaId, today, actions }: Props) {
  const existing = areaId ? snapshot.areas.find((a) => a.id === areaId) : undefined
  const [name, setName] = useState(existing?.name ?? '')
  const [problem, setProblem] = useState<string | null>(null)

  if (areaId && !existing) return <Missing what="area" />

  const activeHabitCount = existing
    ? snapshot.habits.filter((h) => h.areaId === existing.id && !h.archivedDay).length
    : 0

  async function submit(e: FormEvent) {
    e.preventDefault()
    const cleanedName = cleanName(name)
    if (!cleanedName) {
      setProblem('Give the area a name.')
      return
    }
    const area = existing
      ? { ...existing, name: cleanedName }
      : makeArea(cleanedName, nextOrder(snapshot.areas))
    if (await actions.saveArea(area)) navigate('/manage')
  }

  async function archive() {
    if (!existing) return
    const habits = activeHabitCount === 1 ? '1 habit' : `${activeHabitCount} habits`
    const ok = window.confirm(
      `Archive "${existing.name}" and its ${habits}? They leave Today starting now. History is kept, and you can restore them later.`,
    )
    if (ok && (await actions.archiveArea(existing.id, today))) navigate('/manage')
  }

  return (
    <main>
      <BackLink />
      <h1 className="page-title">{existing ? 'Edit area' : 'New area'}</h1>

      <form onSubmit={submit} className="form" noValidate>
        <label className="field">
          <span>Area of life</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            placeholder="e.g. Body, Work, Faith, Relationships"
            autoFocus={!existing}
            enterKeyHint="done"
          />
        </label>

        {problem && (
          <p className="error" role="alert">
            {problem}
          </p>
        )}

        <div className="form-actions">
          <button type="submit" className="primary">
            {existing ? 'Save' : 'Add area'}
          </button>
          <a className="button" href="#/manage">
            Cancel
          </a>
        </div>
      </form>

      {existing && (
        <div className="danger-zone">
          <button type="button" onClick={archive}>
            Archive area
          </button>
        </div>
      )}
    </main>
  )
}
