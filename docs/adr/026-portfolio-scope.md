# ADR 026 — FireflyBC is a portfolio piece; the feature scope is frozen

Status: Proposed (2026-11-07) — awaiting owner review. Amended by ADR 027 (location alerts).

## Context

FireflyBC was planned as an MVP for "seeing where active wildfires are, without visiting the BC
Wildfire Service site" (ADR 001, ADR 003). By 2026-11-07 the MVP features in `docs/behaviour.md`
are built. A product review on that date asked what problem the app solves. Findings:

- **The stated problem is already solved, and solved better.** The official BC Wildfire Service
  app and map show active fires, perimeters, evacuation orders and alerts, open-burning and
  campfire bans, area restrictions and fire danger ratings. They offer three saved locations with
  notifications for new fires, bans, road events and evacuations, and a way to report a fire. An
  independent app (WildFire-Ready) also offers saved locations and evacuation alerts.
- **FireflyBC adds no new information.** The drone is virtual and senses nothing. The only data
  is the same public BCWS feed the official app uses.
- **Compared with a working wildfire drone product.** Nova (from Hummingbird Drones, Kamloops)
  flies infrared drones at night, finds hotspots with machine learning in minutes, and gives crews
  a map with coordinates on their phones. It has a named user (a crew planning mop-up), a decision
  the output drives (where to send the crew), new information (heat people cannot see) and a short
  time to answer. FireflyBC has none of these four.
- **What FireflyBC does have:** fires shown on 3D terrain from a viewpoint the user moves, and
  the engineering behind it.

Sources: BCWS app reference guide
(https://www2.gov.bc.ca/gov/content/safety/wildfire-status/about-bcws/appreferenceguide),
WildFire-Ready (https://techcouver.com/2026/05/01/wildfire-ready-data-map-can-monitor-the-situation/),
Nova (https://bcbusiness.ca/business/tech-science/bc-wildfire-technology-prevention-startups/).

## Options considered

1. **A tool for residents.** Saved places, "view from here", "what changed since your last
   visit", an evacuation orders and alerts overlay. Rejected: it drives no decision the official
   app does not already cover; push alerts need a backend (ADR 001 rules one out); showing
   evacuation data carries liability; no resident was asked whether they need it.
2. **A tool for people who explain fires to others** (local reporters, community page admins,
   teachers): shareable 3D views and image export. Rejected for now: the need is real but small
   and unchecked. It would need conversations with at least five people in that group first.
3. **A portfolio piece.** Finish what is built, freeze the features, and present the engineering
   and the decisions. **Chosen by the owner.**

## Decision

**Option 3.** FireflyBC is a portfolio piece.

- The feature scope is frozen at what `docs/behaviour.md` describes on 2026-11-07. A new feature
  needs a new ADR that supersedes this one.
- Allowed work: bug fixes, performance, accessibility, security, documentation, dependency
  updates, and the finishing steps in `docs/roadmap.md` Phase 7.
- "Finished" means the roadmap's definition of done, as amended by this ADR: the README presents
  the project, every row of `docs/behaviour.md` §10 has a test or a manual verification note in
  `docs/verification.md`, and production runs on `fireflybc.kcaparas.dev` with the CSP enforced.
- Claims stay honest. The README describes FireflyBC as an independent demo, not a safety tool,
  and points to the official BCWS app and EmergencyInfoBC. The popup disclaimer stays.

## Consequences

- The roadmap's "Explicitly after MVP" list is now out of scope, not deferred.
- ADR 017 (no monitoring or analytics) stays right: a portfolio piece does not need usage numbers.
- `docs/verification.md` is added to the documentation set of ADR 018.
- The product review is part of the portfolio: it shows the project was measured against the
  tools that already exist instead of being extended without a user.
- Reopening the product question needs three things: a named user, a decision the app helps that
  user make, and notes from at least five conversations with people in that group.
