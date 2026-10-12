import { restoreArea, restoreHabit } from '../domain/edit.ts'
import { byOrder } from '../domain/today.ts'
import type { Snapshot } from '../domain/types.ts'
import type { AppActions } from '../hooks/useAppData.ts'

interface Props {
  snapshot: Snapshot
  actions: AppActions
}

/** All areas and their habits, with links into the editors, plus anything archived. */
export function ManageView({ snapshot, actions }: Props) {
  const activeAreas = snapshot.areas.filter((a) => !a.archivedAt).sort(byOrder)
  const archivedAreas = snapshot.areas.filter((a) => a.archivedAt).sort(byOrder)
  const activeAreaIds = new Set(activeAreas.map((a) => a.id))
  const archivedHabits = snapshot.habits.filter((h) => h.archivedDay).sort(byOrder)
  const habitsIn = (areaId: string) =>
    snapshot.habits.filter((h) => h.areaId === areaId && !h.archivedDay).sort(byOrder)

  return (
    <main>
      <h1 className="page-title">Habits</h1>

      {activeAreas.length === 0 && (
        <p className="hint">
          Start with an area of life, like Body, Work, or Relationships. Then add the daily
          habits that move it toward your vision.
        </p>
      )}

      {activeAreas.map((area) => (
        <section key={area.id} className="area">
          <div className="area-heading">
            <h2>{area.name}</h2>
            <a className="text-link" href={`#/manage/area/${area.id}`}>
              Edit area
            </a>
          </div>
          <ul className="list">
            {habitsIn(area.id).map((habit) => (
              <li key={habit.id}>
                <a className="list-row" href={`#/manage/habit/${habit.id}`}>
                  <span className="habit-text">
                    <span>{habit.name}</span>
                    {habit.why && <span className="habit-why">{habit.why}</span>}
                  </span>
                  <span aria-hidden="true" className="chevron">›</span>
                </a>
              </li>
            ))}
            <li>
              <a className="list-row add-row" href={`#/manage/habit/new?area=${area.id}`}>
                + Add habit to {area.name}
              </a>
            </li>
          </ul>
        </section>
      ))}

      <p>
        <a className="button" href="#/manage/area/new">
          + Add area
        </a>
      </p>

      {(archivedAreas.length > 0 || archivedHabits.length > 0) && (
        <details className="archived">
          <summary>Archived ({archivedAreas.length + archivedHabits.length})</summary>
          <ul className="list">
            {archivedAreas.map((area) => (
              <li key={area.id} className="list-row">
                <span>{area.name} (area)</span>
                <button type="button" onClick={() => actions.saveArea(restoreArea(area))}>
                  Restore
                </button>
              </li>
            ))}
            {archivedHabits.map((habit) => (
              <li key={habit.id} className="list-row">
                <span>{habit.name}</span>
                {activeAreaIds.has(habit.areaId) ? (
                  <button type="button" onClick={() => actions.saveHabit(restoreHabit(habit))}>
                    Restore
                  </button>
                ) : (
                  <span className="habit-why">Restore its area first</span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </main>
  )
}
