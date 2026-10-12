# Vision View

A habit tracker built on vision casting: a long-term vision at the top, with daily habits that ladder up to it.

Static React + TypeScript app (Vite), installable on iPhone as a PWA, deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with hot reload |
| `npm test` | Unit tests (Vitest) |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally at `/vision-view/` |
| `npm run icons` | Regenerate PNG app icons from `public/icon.svg` |
