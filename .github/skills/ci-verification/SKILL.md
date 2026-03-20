---
name: ci-verification
description: >
  Verify GitHub Actions CI workflows locally using act before pushing or
  creating pull requests. Use this skill when asked to "run CI", "check CI",
  "verify CI locally", or when preparing a pull request.
---

# CI Verification with act

This project uses [`act`](https://github.com/nektos/act) to run GitHub Actions
workflows locally before pushing, so build/test failures are caught before
CD runs on GitHub.

## Prerequisites

- Docker (OrbStack supported) must be running
- `act` must be installed: `brew install act`
- `~/.actrc` must contain `--container-architecture linux/amd64`

## Environment Setup (OrbStack)

If `DOCKER_HOST` is not set, export it first:

```bash
export DOCKER_HOST="unix://${HOME}/.orbstack/run/docker.sock"
```

To make this permanent, append to `~/.actrc`:

```bash
echo "--env DOCKER_HOST=unix://${HOME}/.orbstack/run/docker.sock" >> ~/.actrc
```

## Workflow Files

| File | Trigger | Purpose |
|------|---------|---------|
| `.github/workflows/e2e.yml` | `pull_request → main` | Type check + build + E2E tests |
| `.github/workflows/deploy.yml` | `push → main` | Production build + GitHub Pages deploy |

## Commands

### List available jobs

```bash
act --list
```

### Run PR CI (full: type check → build → E2E)

```bash
DOCKER_HOST="unix://${HOME}/.orbstack/run/docker.sock" \
  act pull_request \
  --container-architecture linux/amd64
```

### Run only the e2e job (faster feedback)

```bash
DOCKER_HOST="unix://${HOME}/.orbstack/run/docker.sock" \
  act pull_request -j e2e \
  --container-architecture linux/amd64
```

### Debug output

```bash
DOCKER_HOST="unix://${HOME}/.orbstack/run/docker.sock" \
  act pull_request -j e2e \
  --container-architecture linux/amd64 \
  -v
```

## Pre-PR Checklist

Before creating a pull request, verify all of the following pass locally:

1. `pnpm build` — production build succeeds (no bundler errors)
2. `pnpm exec tsc --noEmit` — no TypeScript errors
3. `act pull_request -j e2e ...` — CI green locally

## Design Rationale

- The `e2e.yml` CI workflow runs `pnpm build` **before** E2E tests.
  This ensures bundler errors (e.g. invalid `manualChunks` format for rolldown)
  are caught at PR review time, not after merging when `deploy.yml` runs.
- `deploy.yml` runs independently on push to `main` and is not replicated in CI
  to avoid redundancy.

## Known Pitfalls

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `manualChunks is not a function` | rolldown requires function, not object | Use `manualChunks(id) { ... }` in `vite.config.ts` |
| `no DOCKER_HOST` warning | OrbStack socket not on default path | Set `DOCKER_HOST` as above |
| M-series architecture warnings | act defaults to host arch | Use `--container-architecture linux/amd64` |
