// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { STORAGE_KEY } from './storage/localStore.ts'

// Drives the real app in a simulated browser: the screens, the router, and LocalStore together.

function goTo(hash: string) {
  window.location.hash = hash
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

beforeEach(() => {
  localStorage.clear()
  window.location.hash = ''
  window.scrollTo = vi.fn()
  window.matchMedia = vi.fn().mockReturnValue({ matches: false })
})

afterEach(cleanup)

describe('App', () => {
  it('goes from empty to a checked-off habit, saved in localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Empty Today points to the editor.
    await user.click(await screen.findByRole('link', { name: 'Add your first one' }))
    goTo('#/manage')

    // Add an area.
    await user.click(await screen.findByRole('link', { name: '+ Add area' }))
    goTo('#/manage/area/new')
    await user.type(await screen.findByLabelText('Area of life'), 'Body')
    await user.click(screen.getByRole('button', { name: 'Add area' }))

    // Add a habit with a why.
    goTo('#/manage')
    await user.click(await screen.findByRole('link', { name: '+ Add habit to Body' }))
    await user.type(await screen.findByLabelText('Habit'), 'In bed by 11')
    await user.type(screen.getByLabelText('Why (optional)'), 'Tomorrow starts tonight.')
    await user.click(screen.getByRole('button', { name: 'Add habit' }))

    // Check it off on Today.
    goTo('#/')
    const habit = await screen.findByRole('checkbox', { name: /In bed by 11/ })
    expect(screen.getByText('Tomorrow starts tonight.')).toBeTruthy()
    expect(screen.getByText('0 of 1')).toBeTruthy()
    await user.click(habit)
    expect(await screen.findByText('1 of 1')).toBeTruthy()

    // It's persisted.
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.data.checkins).toHaveLength(1)
    expect(saved.data.checkins[0].done).toBe(true)
  })

  it('saves the vision and shows the anchor only when enabled', async () => {
    const user = userEvent.setup()
    goTo('#/settings')
    render(<App />)

    await user.type(await screen.findByLabelText('Vision'), 'Whole and present.')
    await user.type(screen.getByLabelText('Anchor (optional)'), 'Steady on.')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('status')).toBeTruthy()

    goTo('#/')
    expect(await screen.findByText('Whole and present.')).toBeTruthy()
    expect(screen.queryByText('Steady on.')).toBeNull()

    goTo('#/settings')
    await user.click(await screen.findByLabelText('Show the anchor on Today'))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    goTo('#/')
    expect(await screen.findByText('Steady on.')).toBeTruthy()
  })

  it('archives a habit, restores it, and erases everything', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)

    goTo('#/manage/area/new')
    await user.type(await screen.findByLabelText('Area of life'), 'Work')
    await user.click(screen.getByRole('button', { name: 'Add area' }))
    goTo('#/manage')
    goTo((await screen.findByRole('link', { name: '+ Add habit to Work' })).getAttribute('href')!)
    await user.type(await screen.findByLabelText('Habit'), 'Deep work')
    await user.click(screen.getByRole('button', { name: 'Add habit' }))

    goTo('#/manage')
    goTo((await screen.findByRole('link', { name: /Deep work/ })).getAttribute('href')!)
    await user.click(await screen.findByRole('button', { name: 'Archive habit' }))

    goTo('#/')
    expect(await screen.findByText(/No habits yet/)).toBeTruthy()

    goTo('#/manage')
    const archived = await screen.findByText(/Archived \(1\)/)
    await user.click(archived)
    const row = screen.getByText('Deep work').closest('li')!
    await user.click(within(row).getByRole('button', { name: 'Restore' }))
    goTo('#/')
    expect(await screen.findByRole('checkbox', { name: /Deep work/ })).toBeTruthy()

    goTo('#/settings')
    await user.click(await screen.findByRole('button', { name: 'Erase all data' }))
    expect(await screen.findByText(/No habits yet/)).toBeTruthy()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
