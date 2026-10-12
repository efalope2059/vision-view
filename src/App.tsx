import { NavBar } from './components/NavBar.tsx'
import { DEFAULT_DAY_BOUNDARY_HOUR } from './domain/dates.ts'
import { useAppData } from './hooks/useAppData.ts'
import { useHashRoute } from './hooks/useHashRoute.ts'
import { useTodayKey } from './hooks/useTodayKey.ts'
import { AreaForm } from './views/AreaForm.tsx'
import { HabitForm } from './views/HabitForm.tsx'
import { ManageView } from './views/ManageView.tsx'
import { SettingsView } from './views/SettingsView.tsx'
import { TodayView } from './views/TodayView.tsx'

function App() {
  const { snapshot, error, actions } = useAppData()
  const route = useHashRoute()
  const day = useTodayKey(snapshot?.profile.dayBoundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR)
  const [section, kind, id] = route.path

  function screen() {
    if (!snapshot) return null
    if (section === 'settings') return <SettingsView snapshot={snapshot} actions={actions} />
    if (section === 'manage' && kind === 'habit') {
      const habitId = id === 'new' ? null : id
      return (
        <HabitForm
          key={id}
          snapshot={snapshot}
          habitId={habitId}
          defaultAreaId={route.params.get('area')}
          today={day}
          actions={actions}
        />
      )
    }
    if (section === 'manage' && kind === 'area') {
      const areaId = id === 'new' ? null : id
      return <AreaForm key={id} snapshot={snapshot} areaId={areaId} today={day} actions={actions} />
    }
    if (section === 'manage') return <ManageView snapshot={snapshot} actions={actions} />
    return (
      <TodayView
        snapshot={snapshot}
        day={day}
        onToggle={(habitId, done) => actions.toggleCheckin(habitId, day, done)}
      />
    )
  }

  return (
    <>
      {error && (
        <p className="error" role="alert">
          Something went wrong: {error}
        </p>
      )}
      {screen()}
      <NavBar current={section ?? ''} />
    </>
  )
}

export default App
