# ADR 027 — Location alerts: the nearest active fire to the user, in tiers, in the app only

Status: Proposed (2026-11-07) — awaiting owner review. Amends ADR 026 (adds one feature to the
frozen scope).

## Context

ADR 026 froze FireflyBC as a portfolio piece. On the same day the owner chose to add one personal
safety feature to make it a stronger one.

The problem: the BC Wildfire Service map shows fires as dots on a flat map. Someone living near a
fire cannot easily tell how close it is to their home or their road out. FireflyBC already shows
fires on real 3D terrain. This feature adds the user's own position: how far is the nearest
active fire from me, and what should I do about it?

Constraints that still hold: no backend (ADR 001), no monitoring (ADR 017), zod at every boundary
(convention 008), the 60 fps simulation stays out of Redux (ADR 011). The fire feed's fetching and
polling (ADR 003) stay as they are.

## Options considered

**How to measure "near"**

1. **Straight-line (haversine) distance from the user to each active fire's reported point.**
   Works for every fire and needs no new data. It measures to the single point BCWS reports, not
   to the fire's edge: for a large fire the edge can be many kilometres closer than the point. It
   also ignores wind, terrain and growth.
2. **Distance to the mapped perimeter's edge when one exists, else the point.** More accurate for
   large fires. Needs point-to-polygon distance over the perimeter data we already fetch (ADR 023).
3. **A risk score from wind, terrain and fuel.** We cannot model fire behaviour, and a score would
   read as an authority.

**When to ask for location**

1. **On page load.** Browsers and Lighthouse flag it, and people deny prompts they did not ask for.
2. **Off at launch; a "Location alerts" button turns it on for the session.** The browser prompts
   the first time and remembers the answer itself.
3. **Remember the user's on/off choice in `localStorage`.** Stores something about location
   against the owner's rule that nothing location-related is persisted.

**How to alert**

1. **Push notifications.** Need a push server, so a backend.
2. **An in-app banner** using the existing HUD banner patterns.

## Decision

Measure with **option 1** (owner's choice), ask with **option 2**, alert with **option 2**.

- **Tiers** on the nearest active fire's distance *(tunable)*: under 10 km **Ready to leave**,
  under 30 km **Prepare**, under 50 km **Aware**, 50 km or more no alert.
- **Active** means status is not `Out`, whatever the "Show fires that are out" toggle says.
- **When:** on every position update and every fire feed response. The alert reads the existing
  feed query; nothing in the fetch or the polling changes.
- **Location:** `navigator.geolocation.watchPosition` with low accuracy and positions up to 60 s
  old. Each position is validated with zod. It lives in Redux, in memory, for the session only:
  never written to storage, never sent to a server, never put in a URL, never logged. Turning
  alerts off stops the watch and forgets the position.
- **Never an authority.** The alert names its measure (straight-line distance to the fire's
  reported location), says it is not an evacuation order, links to EmergencyInfoBC for evacuation
  orders and alerts (issued by local authorities and First Nations, not BCWS) and to the BC
  Wildfire Service map, and carries the same source note as the fire popup.
- **Header:** `Permissions-Policy` changes from `geolocation=()` to `geolocation=(self)`, or the
  browser blocks the feature in production.
- ADR 026 still holds for everything else: no other new features without a new ADR.

## Consequences

- A user near a large fire can get a lower tier than the fire's edge would justify. The alert
  says what it measures. Option 2 is the natural follow-up and needs its own ADR.
- The alert depends on the fire feed. With no data it says it cannot check, instead of showing
  nothing; with stale data it keeps alerting and the source note shows the fetch time.
- FireflyBC sends the position nowhere. The browser's own location service (for example, a
  network location provider) is outside the app's control.
- Docs updated: `docs/behaviour.md` §12 and §10, `docs/security.md` §1, §3 and §7,
  `docs/verification.md`, `docs/roadmap.md` Phase 8.
