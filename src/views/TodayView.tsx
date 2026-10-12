import { HabitRow } from '../components/HabitRow.tsx'
import { formatDayLabel } from '../domain/dates.ts'
import { buildToday } from '../domain/today.ts'
import type { DayKey, Snapshot } from '../domain/types.ts'

interface Props {
  snapshot: Snapshot
  day: DayKey
  onToggle: (habitId: string, done: boolean) => void
}

export function TodayView({ snapshot, day, onToggle }: Props) {
  const groups = buildToday(snapshot, day)
  const rows = groups.flatMap((g) => g.rows)
  const doneCount = rows.filter((r) => r.done).length
  const { vision, anchor } = snapshot.profile

  return (
    <main>
      <header className="horizon-header">
        {vision ? (
          <p className="vision">{vision}</p>
        ) : (
          <p className="vision">
            <a href="#/settings">Write your vision</a>
          </p>
        )}
        <hr className="horizon" />
        {anchor.enabled && anchor.text && <p className="anchor">{anchor.text}</p>}
      </header>

      <div className="day-line">
        <h1>{formatDayLabel(day)}</h1>
        <p className="progress">
          {doneCount} of {rows.length}
        </p>
      </div>

      {groups.length === 0 && (
        <p className="hint">
          No habits yet. <a href="#/manage">Add your first one</a>.
        </p>
      )}

      {groups.map(({ area, rows }) => (
        <section key={area.id} className="area" aria-labelledby={`area-${area.id}`}>
          <h2 id={`area-${area.id}`}>{area.name}</h2>
          <ul className="checklist">
            {rows.map(({ habit, done }) => (
              <HabitRow key={habit.id} habit={habit} done={done} onToggle={onToggle} />
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
