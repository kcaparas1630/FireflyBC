# FireflyBC

[![ci](https://github.com/kcaparas1630/FireflyBC/actions/workflows/ci.yml/badge.svg)](https://github.com/kcaparas1630/FireflyBC/actions/workflows/ci.yml)

Fly a 3D drone over the real terrain of British Columbia and see the province's active wildfires
from the air, live from BC Wildfire Service open data.

**Live:** https://fireflybc.kcaparas.dev

<!-- Add a short recording here after the production deploy (docs/roadmap.md Phase 7, item 6). -->

> FireflyBC is an independent portfolio project. It is not affiliated with the BC Wildfire
> Service and is not a safety tool. For wildfire information and evacuations, use the official
> [BC Wildfire Service app](https://www2.gov.bc.ca/gov/content/safety/wildfire-status/about-bcws/appreferenceguide)
> and [EmergencyInfoBC](https://www.emergencyinfobc.gov.bc.ca/).

## What it does

- **Free flight** over Mapbox satellite imagery and 3D terrain, with a chase camera, keyboard
  controls on desktop and a touch stick and climb slider on phones.
- **Search to fly:** pick a BC place and the drone plans a route around the mountains, climbs,
  cruises and descends to it. Any manual input pauses the route; Resume re-plans it.
- **Live wildfires:** every active BCWS fire is drawn on the terrain as a scorched footprint (the
  mapped perimeter, or the reported area) with a flame sized by status. The fire panel lists the
  fires by distance from the drone, with a compass arrow to each one, and opens their details.
- **Location alerts:** turn them on and FireflyBC finds the active fire nearest to you and shows
  one of three tiers: **Ready to leave** (under 10 km), **Prepare** (under 30 km) or **Aware**
  (under 50 km), with what to do and links to the official evacuation information. Your
  position stays in the browser's memory: never stored, never sent anywhere. It is an early
  warning, not an evacuation order ([ADR 027](docs/adr/027-location-proximity-alerts.md)).
- **Cockpit:** heading-up compass with fire blips, place name, speed, climb rate and altitude.
  Separate layouts for desktop, phone landscape and phone portrait.
- **Installable** as a PWA.

## Engineering highlights

- **three.js inside Mapbox GL JS.** The drone and the flames are drawn in a Mapbox custom layer
  that shares the map's WebGL context, placed in Mercator units on the terrain
  ([ADR 005](docs/adr/005-threejs-mapbox-custom-layer.md)).
- **A 60 fps simulation outside React.** A fixed-step loop owns the drone state. Redux receives a
  snapshot at most four times a second, and the loop never subscribes to the store
  ([ADR 001](docs/adr/001-architecture.md), [ADR 011](docs/adr/011-state-redux-toolkit-rtk-query.md)).
  A custom ESLint rule rejects allocations inside the render loop.
- **Terrain-aware routing.** The route planner decodes Mapbox terrain-RGB tiles, scores seven
  candidate paths (the straight line and six curves) by the highest ground they cross and their
  extra length, and builds a climb–cruise–descent
  profile that clears ridges by 300 m, with a live safety net looking 6 km ahead
  ([ADR 022](docs/adr/022-terrain-aware-route-profile.md)).
- **Untrusted data at every boundary.** The paginated ArcGIS fire feed, the search results and
  saved state all pass through zod schemas; a bad feed shows a stale-data badge instead of
  breaking the app ([ADR 003](docs/adr/003-wildfire-data-bcws-arcgis.md)).
- **Cost control without a backend.** Each Mapbox API has a per-minute and per-day request
  budget in the browser ([ADR 025](docs/adr/025-mapbox-request-budgets.md)).
- **Privacy by construction.** The user's position comes from `watchPosition` only after they
  opt in, is validated with zod, lives in session memory and is never persisted, sent or logged;
  the response header allows geolocation for this origin only.
- **Conventions as code.** Feature-Sliced Design boundaries, naming, one responsibility per file,
  and comment rules are enforced by ESLint, 12 custom rules with their own tests, and convention
  scripts. 555 unit tests (the pure simulation, routing and data modules are at about 99 % line
  coverage), plus a Playwright suite running WebGL on SwiftShader in CI.

## How it was built

Documentation came before code. Every decision is an
[architecture decision record](docs/adr/index.md) that keeps the rejected options; the
[behaviour spec](docs/behaviour.md) defines every mode, control and edge case; each edge case is
mapped to a test or a manual check in [verification](docs/verification.md).

Much of the code was written by AI coding agents (Claude Code) working from those documents. A
Stop hook runs `bun run check` (typecheck, lint, format, tests, convention scripts), so no
change, human or agent, can finish with a failing check
([convention 012](docs/code-convention/012-agent-hooks-enforcement.md)).

## Scope

FireflyBC set out to show where BC's wildfires are. A product review found that the official BC
Wildfire Service app already does that, with evacuation orders, fire bans and notifications, and
that a virtual drone adds no new information. The project is therefore finished as a portfolio
piece with its features frozen; the reasoning and the alternatives are in
[ADR 026](docs/adr/026-portfolio-scope.md). One feature was added after that review: location
alerts, which answer "how close is the nearest fire to me?" for the user's own position
([ADR 027](docs/adr/027-location-proximity-alerts.md)). They measure straight-line distance to
the fire's reported point, not its edge, and say so.

## Stack

React 19 · TypeScript (strict) · Vite + vite-plugin-pwa · Bun · Mapbox GL JS v3 · three.js ·
Redux Toolkit + RTK Query · Tailwind CSS v4 + shadcn/ui · zod · ESLint + Prettier · Vitest ·
Playwright · Vercel (static, no backend).

## Run it locally

You need [Bun](https://bun.sh), Node 22 (for Playwright) and a public Mapbox token (`pk.…`).

```
cp .env.example .env.local      # then set VITE_MAPBOX_TOKEN
bun install --frozen-lockfile
bun run dev
```

```
bun run check                   # typecheck, lint, format, unit tests, convention scripts
bun run test:e2e                # Playwright
bun run build && bun run preview
```

## Controls

| Desktop | Action |
|---|---|
| W / ↑, S / ↓ | Forward, brake / reverse |
| A / ←, D / → | Turn |
| Space, Shift | Climb, descend |
| E or Ctrl (hold) | Boost |
| / or Ctrl+K | Search |
| Esc | Close the fire details, cancel the route |
| Drag, wheel | Orbit the camera, follow distance |

On phones: left stick to move and turn, right slider to climb and descend, Boost button.

## Data and credits

Wildfire data: BC Wildfire Service open data, fetched live from its public ArcGIS feature
service. Maps, terrain, search and place names: © Mapbox, © OpenStreetMap contributors.
