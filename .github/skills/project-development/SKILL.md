---
name: project-development
description: >
  Development guidelines and workflow for the googlemap-timeline-visualizer
  project. Use this skill when asked to add features, fix bugs, or understand
  the project structure, tech stack, coding conventions, or commit rules.
---

# Project Development — googlemap-timeline-visualizer

A privacy-first, browser-only web app that visualises Google Maps location
history and exports it as video.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19 |
| Language | TypeScript (strict) | 5.9 |
| Build | Vite + rolldown | 8 |
| Styling | Tailwind CSS | 4 |
| Maps | Leaflet | 1.9 |
| Video encode | FFmpeg.wasm | 0.12 |
| Icons | Lucide React | latest |
| E2E tests | Playwright | 1.58 |
| Package manager | pnpm | 10 |

## Repository Structure

```
src/
  components/   React UI components (PascalCase.tsx)
  hooks/        Custom hooks (useXxx.ts)
  utils/        Pure utility functions
  types.ts      Shared type definitions
  App.tsx       Root component
e2e/            Playwright E2E tests (*.spec.ts)
.github/
  workflows/
    e2e.yml     PR CI: type-check + build + E2E
    deploy.yml  CD: build + deploy to GitHub Pages
  skills/       Copilot Agent Skills (this directory)
public/         Static assets and PWA manifest
scripts/        Build helper scripts
```

## Development Commands

```bash
pnpm install        # Install deps (also copies Leaflet to public/lib/)
pnpm dev            # Dev server at http://localhost:5173
pnpm build          # tsc + vite build → dist/   ← run before every PR
pnpm preview        # Preview the production build
pnpm test           # Playwright E2E (headless)
pnpm test:e2e       # Playwright E2E (headed, for debugging)
pnpm exec tsc --noEmit  # Type-check only
```

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — no direct commits |
| `feature/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `chore/<name>` | Config / deps / docs |

## Commit Convention (Conventional Commits)

Format: `<type>(<scope>): <summary>`

| Type | When to use |
|------|------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Build / deps / config |
| `docs` | Documentation only |
| `refactor` | Refactoring without behaviour change |
| `test` | Adding or fixing tests |
| `ci` | CI/CD workflow changes |
| `perf` | Performance improvement |

Examples:
```
fix(vite): change manualChunks to function form for rolldown compatibility
ci(e2e): add production build step to catch bundler errors before deploy
```

## TypeScript Rules

- **strict mode** is enabled — never disable it
- No `any` type; use `unknown` + type guards where necessary
- No bare type assertions (`as Foo`) — prefer type narrowing
- `noUnusedLocals` and `noUnusedParameters` are enforced by `tsc`

## React Rules

- Functional components + Hooks only
- Component files: `PascalCase.tsx`
- Hook files: `useCamelCase.ts`
- Never omit `useEffect` dependency arrays

## vite.config.ts Rules

`manualChunks` **must be a function** — rolldown rejects the object form:

```ts
// ✅ Correct
manualChunks(id: string) {
  if (id.includes('@ffmpeg/ffmpeg') || id.includes('@ffmpeg/util')) return 'ffmpeg';
}

// ❌ Will break the build
manualChunks: { ffmpeg: ['@ffmpeg/ffmpeg'] }
```

## Security & Privacy

- All data processing must stay **browser-only** — no server calls for user data
- Never use `eval()` or `dangerouslySetInnerHTML`
- Run `pnpm audit` when adding new dependencies
- Validate all user inputs at the file-upload boundary

## CI/CD Overview

- PRs trigger `e2e.yml`: type-check → **production build** → E2E tests
- Merging to `main` triggers `deploy.yml`: build → GitHub Pages
- The build step in CI prevents "CI green but CD fails" by catching bundler
  errors during PR review. See the `/ci-verification` skill for local CI usage.
