# Roadmap — step by step to the MVP

Order is chosen to retire the riskiest unknowns first. Each phase ends with something runnable
and a check that `bun run check` and the Stop hook pass. No phase starts code before the owner
has approved the docs (ADR 018).

## Phase 0 — Enforcement scaffold (no app code)

Goal: the conventions are executable before any feature exists.

1. `bun create vite` (react-ts), Bun lockfile, `.gitignore`, `.env.example`.
2. `tsconfig` per convention 004; path alias `@/`.
3. ESLint flat config: typescript-eslint strict-type-checked, react-hooks, boundaries (FSD map),
   unicorn filename-case, import, vitest plugin; `eslint/local-rules/` with all ten rules and
   their `RuleTester` tests; `eslint/approved-verbs.ts`.
4. Prettier + tailwind plugin; Vitest config with coverage thresholds scoped to pure paths.
5. `scripts/`: `stop-hook.ts`, `format-touched-file.ts`, `check-tests-exist.ts`,
   `count-todos.ts`, `count-eslint-disables.ts`, `check-no-secrets.ts`,
   `check-hooks-configured.ts`.
6. `.claude/settings.json` with the Stop and PostToolUse hooks; `simple-git-hooks` + commitlint.
7. Empty FSD skeleton (`src/app … src/shared`) with `index.ts` files so boundaries can be tested.
8. GitHub Actions `ci.yml` (bun + node 22, check, audit; e2e job added in Phase 6).

**Done when:** `bun run check` passes on the skeleton; a deliberately bad file (vague name, missing
comment, deep import) is rejected by the Stop hook with a readable message.

## Phase 1 — Map on screen

1. `shared/config/env.ts`, `bc-bounding-box.ts`; `widgets/map-view` creating the map (mercator,
   terrain, Standard style, bounds, handlers off, `performanceMetricsCollection: false`).
2. WebGL2 guard and context-lost overlay; `pages/map-page`; Tailwind + shadcn init; HUD shell.
3. **Spike A:** confirm Standard style + `projection: 'mercator'` + terrain render together and
   measure the frame cost.

**Done when:** BC renders with terrain in dev and on a Vercel preview with the dev token.

## Phase 2 — Drone in the world

1. `entities/drone`: `SimWorld`, `stepFreeFlight`, snapshot bridge, persistence schema (unit
   tests first).
2. `drone-layer` custom layer with a primitive mesh; `shared/lib/geo` (mercator, bearing,
   destination, scale); frame loop with fixed timestep.
3. `features/control-drone` keyboard input with focus/blur rules; bounds soft clamp.
4. **Spike B:** load the owner's GLB; set orientation/scale constants; check size (Draco if > 2 MB).

**Done when:** the drone flies with WASD over terrain at 60 fps on the owner's laptop, position
persists across reloads.

## Phase 3 — Chase camera and terrain floor

1. `entities/map-camera`: `computeChaseCamera` → `FreeCameraOptions`; orbit offset on drag; wheel
   distance; reduced-motion.
2. `entities/terrain`: null-safe `sampleTerrainElevation`, lookahead sampler, altitude rules
   (floor) with unit tests covering the all-null case.
3. HUD: speed, altitude MSL/AGL, heading, mode badge, edge-of-BC notice.
4. **Spike C:** measure how often `queryTerrainElevation` returns null at 6 km lookahead during a
   fast flight; tune lookahead distances.

**Done when:** flying into a mountain lifts the drone; camera stays behind it; HUD numbers match.

## Phase 4 — Search and auto-route

1. `entities/route`: `planGeodesicRoute`, `advanceAlongRoute`, duration/easing (unit tests).
2. `mode` slice with the state machine and guard tests; `features/fly-to-place`,
   `features/pause-resume-route`; route banner; arrival card; recents in `prefs`.
3. `widgets/search-bar` with `<SearchBox>` (BC filters, lazy session), zod on retrieve, toast
   for outside-BC results.
4. Terrain-following controller for auto-route; speed-scaled camera pull-back; route line layer.
5. **Spike D:** verify Search Box billing behaviour (one session per focus→retrieve) in the
   Mapbox dashboard after ten searches.

**Done when:** "Summerland" flies the drone there over the mountains; WASD pauses; Resume
re-plans; arrival card shows.

## Phase 5 — Wildfires

1. `entities/fire`: ArcGIS `fire.api.ts` (RTK Query, pagination, abort), `fire.schema.ts`
   (rejects `{error}`), normaliser, selectors, status palette (tests with recorded fixtures).
2. Hit-test circle layer + hover tooltip; `features/select-fire`; `widgets/fire-popup` with
   allow-listed link and "Fly here".
3. Beacon `InstancedMesh` in `drone-layer`, terrain-anchored, zoom-scaled, status-coloured, pulse
   (disabled under reduced motion / low fps).
4. Stale badge logic; offline banner; arrival card "fires within 25 km".

**Done when:** today's active fires show as beacons, popup opens, "Fly here" works, feed outage
shows stale badge without breaking anything.

## Phase 6 — PWA, hardening, CI e2e, deploy

1. `vite-plugin-pwa` manifest (`name: "FireflyBC"`, `short_name: "FireflyBC"`, `id: "/"`,
   `start_url: "/"`, `display: "standalone"`) + precache; install button; update toast;
   401 → reload prompt.
2. `vercel.json` headers (report-only on preview → enforce); Vercel project `fireflybc` with
   production domain `fireflybc.kcaparas.dev` (CNAME at the DNS provider for `kcaparas.dev`);
   Vercel env tokens; Mapbox usage alert set.
3. Playwright smoke suite with BCWS and Search Box route fixtures; SwiftShader flags; CI job.
4. Low-end device fallbacks; 360 px layout pass; keyboard/a11y pass; bundle size check.
5. Owner review against `docs/behaviour.md` edge-case tables.

**Done when:** production deploy on `fireflybc.kcaparas.dev` passes every row in behaviour §10 that can
be reproduced manually, Lighthouse PWA installable, CSP enforced with no console violations.

## Phase 7 — Portfolio finish (ADR 026)

Goal: present the finished app. No new features.

1. `README.md` presents the project: what it is, the live link, the engineering, the decisions,
   how to run it, and an honest scope statement.
2. `docs/verification.md` lists every row of behaviour §10 with the test that covers it, or a
   manual check. The owner runs the manual checks on production and fills in the date and result.
3. The owner accepts or rejects ADRs 019–026.
4. CSP: deploy a preview with `Content-Security-Policy-Report-Only`, do a full flight, search and
   popup with DevTools open, and confirm no violations; then rename the header to
   `Content-Security-Policy` in `vercel.json` (security §3).
5. Production on `fireflybc.kcaparas.dev` with the URL-restricted prod token; dev token rotated
   and the rotation logged in `docs/security.md` §2.
6. The owner records a short flight (Vancouver → Summerland, open a fire near Kelowna) from
   production and adds it to the README.
7. The owner picks a license (or states "all rights reserved") and adds `LICENSE`.

**Done when:** every item above is done and CI is green on `main`.

## Phase 8 — Location alerts (ADR 027)

Goal: the one feature added after the freeze. Docs first: ADR 027, behaviour §12 and §10,
security §1, §3, §7.

1. `entities/user-location`: session-only position slice, zod position schema, geolocation
   adapter in `api/` (unit tests first).
2. `entities/fire`: `findNearestActiveFire` (not `Out`, haversine); `shared/config/location-alert.ts`
   with the tier limits.
3. `features/track-user-location`: the watch hook, mounted once in `pages/map-page` so it
   survives rotation.
4. `widgets/location-alert`: Location alerts button, tier from distance, alert card, messages;
   placed in the three cockpits.
5. `vercel.json`: `Permissions-Policy: geolocation=(self)`.

**Done when:** granting location shows the nearest active fire, its distance and the right tier,
updating on movement and on feed refresh; denying shows the message and nothing else changes;
`bun run check` is green; the manual rows in `docs/verification.md` pass on production.

## Definition of done for the MVP

- All ADR decisions implemented as written or superseded by a new ADR.
- `bun run check` and CI (incl. e2e) green; disable budget ≤ 10; TODO budget ≤ 20.
- Every row of `docs/behaviour.md §10` has either a test or a manual verification note.
- `docs/security.md` checklist satisfied; prod token restricted; dev token rotated at launch.
- Owner can fly from Vancouver to Summerland, see the fires near Kelowna, open one, and reach BCWS.

## Out of scope (ADR 026)

FireflyBC is a portfolio piece and its feature scope is frozen. These were once planned for after
the MVP and are now out of scope: offline tiers (ADR 006 options 1–3), gamepad, geolocation spawn,
monitoring (ADR 017), proxy/cache for BCWS, multi-language. These were considered in the
2026-11-07 product review and rejected: saved places, "view from here", "since your last visit",
an evacuation orders and alerts overlay, shareable 3D views, a road-trip check, push alerts.
Reopening any of them needs a new ADR that supersedes ADR 026. ADR 027 added one feature after
that review: in-app location alerts (Phase 8).
