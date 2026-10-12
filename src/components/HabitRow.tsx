import type { Habit } from '../domain/types.ts'

interface Props {
  habit: Habit
  done: boolean
  onToggle: (habitId: string, done: boolean) => void
}

/** One habit on the checklist. The whole row is the tap target. */
export function HabitRow({ habit, done, onToggle }: Props) {
  return (
    <li>
      <label className="habit" data-done={done}>
        <input
          type="checkbox"
          checked={done}
          onChange={(e) => onToggle(habit.id, e.target.checked)}
        />
        <span className="habit-text">
          <span className="habit-name">{habit.name}</span>
          {habit.why && <span className="habit-why">{habit.why}</span>}
        </span>
      </label>
    </li>
  )
}
