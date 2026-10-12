import { useEffect, useMemo, useState } from 'react'

// Screens live in the URL hash (#/manage/habit/123), so GitHub Pages only ever serves
// index.html and a refresh never 404s.

export interface Route {
  /** e.g. ["manage", "habit", "123"]; [] for Today. */
  path: string[]
  params: URLSearchParams
}

export function parseHash(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?')
  return { path: path.split('/').filter(Boolean), params: new URLSearchParams(query) }
}

export function useHashRoute(): Route {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return useMemo(() => parseHash(hash), [hash])
}

/** Go to a screen, e.g. navigate('/manage'). */
export function navigate(to: string): void {
  window.location.hash = to
}
