# Architecture Decision Records

Every decision below was chosen by the owner (Kent) from a list of alternatives during the
planning session on 2026-11-04. Each ADR keeps the rejected options so nobody re-opens a decision
without new information. Status values: `Accepted`, `Superseded by NNN`, `Deprecated`.

| # | Decision | Status |
|---|---|---|
| [001](001-architecture.md) | Static SPA, no backend, three separate state domains, fixed-step frame loop | Accepted |
| [002](002-framework-vite-spa-pwa-bun.md) | Vite SPA + vite-plugin-pwa; Bun as package manager and script runner | Accepted |
| [003](003-wildfire-data-bcws-arcgis.md) | Live wildfire data fetched client-side from the BCWS ArcGIS FeatureServer | Accepted |
| [004](004-drone-interaction-model.md) | Free flight + search-to-fly auto-route; manual input pauses, HUD offers Resume | Accepted |
| [005](005-threejs-mapbox-custom-layer.md) | three.js inside a Mapbox GL JS custom layer (shared WebGL context), mercator only | Accepted |
| [006](006-offline-deferred.md) | Offline deferred; PWA is install-only in MVP | Accepted |
| [007](007-route-geodesic-terrain-following.md) | Auto-route is a straight geodesic with terrain-following altitude | Accepted |
| [008](008-search-mapbox-search-box.md) | Mapbox Search Box API via @mapbox/search-js-react, BC-filtered | Accepted |
| [009](009-hosting-vercel.md) | Vercel static hosting with vercel.json security headers | Accepted |
| [010](010-repository-feature-sliced-design.md) | Feature-Sliced Design, enforced by ESLint | Accepted |
| [011](011-state-redux-toolkit-rtk-query.md) | Redux Toolkit + RTK Query; simulation state lives outside Redux | Accepted |
| [012](012-toolchain-eslint-prettier-vitest-playwright.md) | ESLint + Prettier + Vitest + Playwright | Accepted |
| [013](013-styling-tailwind-shadcn.md) | Tailwind v4 + shadcn/ui | Accepted |
| [014](014-drone-spawn-bounds-camera.md) | Spawn at last saved position (else BC centre), soft-clamped to BC; chase cam | Accepted |
| [015](015-fire-display-points-3d-beacons.md) | Fires as hit-test points + status-coloured 3D beacons in three.js | Accepted |
| [016](016-mapbox-token-strategy.md) | Two public tokens: prod (URL-restricted) and dev (unrestricted, minimal scopes) | Accepted |
| [017](017-no-monitoring-mvp.md) | No error monitoring or analytics in MVP | Accepted |
| [018](018-documentation-structure.md) | docs/adr + docs/code-convention, documentation before code | Accepted |
| [019](019-search-box-core-debounced-combobox.md) | Search Box API via search-js-core with a 300 ms debounced combobox (amends 008) | Proposed |
| [020](020-no-map-max-bounds.md) | No map `maxBounds`; it bounces the chase camera on terrain, the BC soft clamp bounds the view (amends 014) | Proposed |
| [021](021-cockpit-ux-satellite-fire-list.md) | Cockpit UX: satellite basemap, nav cluster with compass and place name, fire list | Proposed |
| [022](022-terrain-aware-route-profile.md) | Auto-route: terrain-aware curved path and a planned climb–cruise–descent profile (amends 007) | Proposed |
| [023](023-fire-scene-perimeters-flames-canopy.md) | Fire scene: scorched perimeters, status-scaled flames, select-then-fly; Canopy theme (amends 015) | Proposed |
| [024](024-mobile-orientation-layouts.md) | Mobile layouts: collapsed portrait with a rotate notice, compact landscape cockpit (amends 021) | Proposed |
| [025](025-mapbox-request-budgets.md) | Client-side request budgets for the Mapbox APIs: per-minute window and per-browser daily cap | Proposed |
| [026](026-portfolio-scope.md) | FireflyBC is a portfolio piece; the feature scope is frozen (amended by 027) | Proposed |
| [027](027-location-proximity-alerts.md) | Location alerts: nearest active fire to the user in three tiers, in-app only, location never stored or sent (amends 026) | Proposed |


## Writing a new ADR

Copy the shape of any ADR: **Context**, **Options considered** (with trade-offs), **Decision**,
**Consequences**. Number it sequentially, add a row here, and link it from `CLAUDE.md` only if
agents need it on every task. Do not edit an accepted ADR's decision; supersede it.
