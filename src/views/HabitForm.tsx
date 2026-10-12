import { useState, type FormEvent } from 'react'
import { archiveHabit, cleanName, cleanText, MAX_NAME_LENGTH, MAX_TEXT_LENGTH, nextOrder } from '../domain/edit.ts'
import { makeHabit } from '../domain/factories.ts'
import { byOrder } from '../domain/today.ts'
import type { DayKey, Snapshot } from '../domain/types.ts'
import type { AppActions } from '../hooks/useAppData.ts'
import { navigate } from '../hooks/useHashRoute.ts'

interface Props {
  snapshot: Snapshot
  /** null when creating a new habit. */
  habitId: string | null
  defaultAreaId: string | null
  today: DayKey
  actions: AppActions
}

export function HabitForm({ snapshot, habitId, defaultAreaId, today, actions }: Props) {
  const existing = habitId ? snapshot.habits.find((h) => h.id === habitId) : undefined
  const areas = snapshot.areas.filter((a) => !a.archivedAt).sort(byOrder)

  const [name, setName] = useState(existing?.name ?? '')
  const [why, setWhy] = useState(existing?.why ?? '')
  const [areaId, setAreaId] = useState(existing?.areaId ?? defaultAreaId ?? areas[0]?.id ?? '')
  const [problem, setProblem] = useState<string | null>(null)

  if (habitId && !existing) {
    return <Missing what="habit" />
  }
  if (areas.length === 0) {
    return (
      <main>
        <BackLink />
        <p className="hint">Add an area first. Every habit belongs to one.</p>
        <a className="button" href="#/manage/area/new">
          + Add area
        </a>
      </main>
    )
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const cleanedName = cleanName(name)
    if (!cleanedName) {
      setProblem('Give the habit a name.')
      return
    }
    const siblings = snapshot.habits.filter((h) => h.areaId === areaId && h.id !== existing?.id)
    const fields = { name: cleanedName, why: cleanText(why), areaId }
    const habit = existing
      ? {
          ...existing,
          ...fields,
          // Moving to another area puts it at the end of that area's list.
          order: existing.areaId === areaId ? existing.order : nextOrder(siblings),
        }
      : makeHabit({ ...fields, order: nextOrder(siblings), startDay: today })
    if (await actions.saveHabit(habit)) navigate('/manage')
  }

  async function archive() {
    if (!existing) return
    const ok = window.confirm(
      `Archive "${existing.name}"? It leaves Today starting now. Its history is kept, and you can restore it later.`,
    )
    if (ok && (await actions.saveHabit(archiveHabit(existing, today)))) navigate('/manage')
  }

  return (
    <main>
      <BackLink />
      <h1 className="page-title">{existing ? 'Edit habit' : 'New habit'}</h1>

      <form onSubmit={submit} className="form" noValidate>
        <label className="field">
          <span>Habit</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            placeholder="e.g. In bed by 11"
            autoFocus={!existing}
            enterKeyHint="done"
          />
        </label>

        <label className="field">
          <span>Area</span>
          <select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Why (optional)</span>
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            maxLength={MAX_TEXT_LENGTH}
            rows={3}
            placeholder="What does this make possible? Shown under the habit on Today."
          />
        </label>

        {problem && (
          <p className="error" role="alert">
            {problem}
          </p>
        )}

        <div className="form-actions">
          <button type="submit" className="primary">
            {existing ? 'Save' : 'Add habit'}
          </button>
          <a className="button" href="#/manage">
            Cancel
          </a>
        </div>
      </form>

      {existing && (
        <div className="danger-zone">
          <button type="button" onClick={archive}>
            Archive habit
          </button>
        </div>
      )}
    </main>
  )
}

export function BackLink() {
  return (
    <a className="text-link back-link" href="#/manage">
      ‹ Habits
    </a>
  )
}

export function Missing({ what }: { what: string }) {
  return (
    <main>
      <BackLink />
      <p className="hint">That {what} doesn't exist anymore.</p>
    </main>
  )
}
