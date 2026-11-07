# FireflyBC — agent guide

**FireflyBC** (`https://fireflybc.kcaparas.dev`) is a browser app for flying a 3D drone over a
Mapbox map of British Columbia and seeing where active wildfires are, without visiting the BC
Wildfire Service site. **This is a portfolio piece and its features are frozen (ADR 026):** only
fixes, performance, accessibility, security, docs and dependency updates without a new ADR.
ADR 027 added location alerts after the freeze; the user's position is session memory only, never
stored, sent or logged. The name is "FireflyBC" in prose and UI,
`fireflybc` in code, keys, hostnames and package names. It is an independent project, not
affiliated with the BC Wildfire Service; never present it as official.

Documentation comes before code (ADR 018). If code and docs disagree, the docs win until the
owner changes them. Read in this order:

| Doc | What it answers |
|---|---|
| `docs/adr/index.md` | Every decision, the alternatives rejected, and why |
| `docs/code-convention/index.md` | Every convention and the rule/script that enforces it |
| `docs/behaviour.md` | Exactly what the app does: launch, modes, controls, search-to-fly, fires, every edge case |
| `docs/security.md` | Threat model, token policy, headers/CSP, validation, supply chain |
| `docs/roadmap.md` | Delivery order, spikes, definition of done |
| `docs/verification.md` | Which test or manual check covers each edge case in behaviour §10 |

## Stack (fixed by ADRs)

React 19 · TypeScript strict · Vite + `vite-plugin-pwa` · Bun (package manager + scripts) ·
Mapbox GL JS v3 (mercator, terrain) · three.js in a Mapbox custom layer · Redux Toolkit + RTK
Query · Tailwind v4 + shadcn/ui · ESLint + Prettier · Vitest · Playwright · Vercel static.

No backend. No auth. No offline data promise (PWA is install-only). No monitoring in MVP.

## Commands

```
bun install --frozen-lockfile
bun run dev
bun run check        # typecheck + lint + format:check + unit tests + convention scripts
bun run test:e2e     # Playwright (Node via bunx)
bun run build && bun run preview
```

The Stop hook runs `bun run check`; you cannot finish a task while it fails. Fix the cause, do not
add `eslint-disable` (budget 10 repo-wide, each needs a `-- reason`).

## Hard rules

1. **Names state responsibility** (`fetch-bc-wildfire-data.ts`, `loadDroneModel()`); functions
   start with an approved verb; no `utils`, `helpers`, `data`, `item`, `init`. (convention 001)
2. **One plain-language line above every file and function** saying what it does. No JSDoc
   blocks. (convention 002)
3. **Feature-Sliced Design**: `app → pages → widgets → features → entities → shared`, import
   downward only, through each slice's `index.ts`. (convention 003)
   **One responsibility per file**: one value export whose name matches the file, ≤ 200 lines;
   split rather than compress. (convention 013)
4. **The 60 fps simulation never goes through Redux or React.** `SimWorld` is read by the loop;
   Redux gets a ≤ 4 Hz snapshot. The loop never subscribes. (ADR 001, 011)
5. **Zod at every boundary**; `fetchJson(url, schema)` is the only fetch; no `setHTML`, no
   `dangerouslySetInnerHTML`. (convention 008)
6. **No allocation in the render loop**; dispose in `onRemove`. (convention 007)
7. **Mapbox token is public by design**, restricted by URL and scopes; prod ≠ dev; never commit
   `.env*` except `.env.example`; never log it. (ADR 016)
8. **Units in names** when ambiguous (`altitudeMsl`, `speedMps`, `headingRad`). (convention 001)
9. **No new runtime dependency without a one-line justification** in the PR. (convention 011)
10. Do not commit, push, deploy, or rotate tokens unless the owner asks in that session.

## Where things go

```
src/app        store, providers, PWA registration, global CSS, entry
src/pages      map-page
src/widgets    map-view (map + custom layer + loop), hud, search-bar, fire-popup, route-banner, joystick, location-alert
src/features   control-drone, fly-to-place, pause-resume-route, select-fire, track-user-location
src/entities   drone, route, fire, terrain, map-camera, location (drone place name), user-location
src/shared     config, lib (geo, redux, result, storage), api, ui (shadcn), types
eslint/        local-rules/ + approved-verbs.ts + config/ (shared ESLint option builders)
scripts/       stop-hook, format-touched-file, check-* convention scripts
```

Owner: Kent Caparas. The drone GLB will be supplied by the owner; use a primitive mesh for spikes
and do not generate a model without asking.
