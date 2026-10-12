import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /<repo-name>/, so every asset URL needs this prefix.
  base: '/vision-view/',
  plugins: [react()],
  define: {
    // Commit SHA of the deployed build (set by GitHub Actions); "dev" locally.
    __BUILD_SHA__: JSON.stringify((process.env.GITHUB_SHA ?? 'dev').slice(0, 7)),
  },
  test: {
    // Pin a timezone with daylight saving so date tests behave the same on every machine and in CI.
    env: { TZ: 'America/Chicago' },
  },
})
