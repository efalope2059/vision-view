const TABS = [
  { key: '', href: '#/', label: 'Today' },
  { key: 'manage', href: '#/manage', label: 'Habits' },
  { key: 'settings', href: '#/settings', label: 'Settings' },
]

/** Bottom tab bar, within thumb reach. */
export function NavBar({ current }: { current: string }) {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((tab) => (
        <a key={tab.key} href={tab.href} aria-current={tab.key === current ? 'page' : undefined}>
          {tab.label}
        </a>
      ))}
    </nav>
  )
}
