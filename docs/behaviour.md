# Behaviour specification

What the app does, step by step, and what happens at every edge. Numbers marked *(tunable)* live in
`src/shared/config/` and were not individually decided; everything else was decided in the ADRs.

## 1. Launch sequence

1. Shell loads (precached after first visit). If WebGL2 is unavailable → full-screen message
   "This browser can't render 3D maps" with a list of supported browsers. Stop.
2. `import.meta.env` is validated; a missing `VITE_MAPBOX_TOKEN` fails fast with a developer
   message (never a blank map).
3. Saved drone state is read from `localStorage` (`fireflybc.drone.v1`). Valid and inside BC → use it;
   otherwise `BC_CENTRE` (Prince George area, *(tunable)*), heading north, altitude
   `DEFAULT_ALT_AGL_M` above terrain *(tunable, 500 m)*.
4. Map is created: Standard Satellite style (ADR 021), `projection: 'mercator'`, terrain on (`mapbox-dem`),
   no `maxBounds` (ADR 020), Mapbox interaction handlers off, `minZoom` 4.
5. Custom layer `drone-layer` is added on `style.load`; the drone GLB is loaded (a wireframe
   placeholder shows until it arrives). Mode = `idle`.
6. Fire feed fetch starts in parallel (RTK Query). HUD shows "Loading fires…".
7. Frame loop starts. The chase cam snaps to the drone (no animation on launch).
8. Online check: if `navigator.onLine` is false, a persistent banner says "Offline — the map and
   search need a connection"; fires show whatever is cached in memory (nothing on cold start).
9. Location alerts start off. Nothing asks for the user's location until they turn the alerts on
   (§12).

## 2. Modes

`idle | freeFlight | autoRoute | paused | arrived` (ADR 004). HUD always shows the current mode.

| From | Event | To | Side effects |
|---|---|---|---|
| idle | any drone input | freeFlight | — |
| idle / freeFlight / arrived | `flyToPlace` (search retrieve, recent, or fire "Fly here") | autoRoute | plan route, HUD banner "Flying to {name}" |
| autoRoute | manual drone input | paused | drone keeps momentum then obeys input; banner shows **Resume** / **Cancel** |
| paused | Resume | autoRoute | re-plan from current position to same destination |
| paused | Cancel / Esc | freeFlight | route cleared |
| autoRoute | within `ARRIVAL_RADIUS_M` *(tunable, 150 m)* of destination | arrived | drone hovers, camera orbits slowly, arrival card with destination name + "Fires within 25 km: N" |
| arrived | any input or Dismiss | freeFlight | — |
| any | search box focused | (unchanged) | drone input disabled while focused |

## 3. Free flight

### 3.1 Controls (desktop) *(tunable mapping in `shared/config/drone-controls.ts`)*

| Key | Action |
|---|---|
| W / ↑ | thrust forward |
| S / ↓ | brake, then reverse at half thrust |
| A / ← , D / → | yaw left / right |
| Space | climb (except while keyboard navigating: after Tab and before any click or tap, Space presses the focused button or checkbox instead) |
| Shift | descend |
| Ctrl or E (hold) | boost ×4 (E is the safe choice with W: Chrome never lets a page intercept Ctrl+W, which closes the tab) |
| Esc | cancel route / close popup / dismiss arrival |
| / or Ctrl+K | focus search |
| R | reset camera orbit offset |

Mouse drag on the map = temporary camera orbit (yaw ±90°, pitch 30–75°) that eases back over
1.5 s after release. Scroll wheel = follow distance within [30 m, 400 m].

### 3.2 Controls (touch)

Left virtual joystick (forward/back + yaw), right vertical slider (climb/descend), boost button,
search button. Joystick is a custom pointer-events component (no dependency). Multi-touch drag on
the map = orbit, pinch = follow distance.

### 3.3 Physics *(tunable)*

- Fixed timestep 1/60 s; frame `dt` clamped to 50 ms; accumulator pattern.
- Max ground speed 150 m/s (boost 600 m/s), acceleration 60 m/s², drag brings speed to zero in
  ~2 s with no input. Yaw rate 90°/s, with a visual bank angle up to 25° (render-only).
- Vertical speed max 60 m/s, altitude range: `[terrain + 30 m, 12 000 m MSL]`.
- Terrain floor: altitude is pushed up smoothly if the drone would fall below terrain + 30 m
  (uses the same lookahead sampler as auto-route, so mountains ahead lift the drone).
- Heading and position use geodesic maths (bearing/destination on a sphere), not flat offsets, so
  long flights stay correct at 60° N.

### 3.4 Bounds

A soft clamp: within 5 km of the BC bbox edge the outward velocity component is scaled down to
zero at the edge; the drone never leaves the bbox. The HUD shows "Edge of British Columbia" while
clamped. The chase camera stays within a few kilometres of the drone, so the view stays over BC.
The map has no `maxBounds`: with terrain it moves the camera off its pose and makes it bounce
(ADR 020).

## 4. Chase camera (ADR 014)

Each frame: camera position = drone position − forward × `FOLLOW_DISTANCE_M` (60 m, scaled by
`1 + speed/maxSpeed`) + up × `FOLLOW_HEIGHT_M` (25 m); `lookAtPoint(drone + forward × LOOK_AHEAD_M)`
(40 m, scaled the same way). Aiming just ahead keeps the horizon in view and the drone a little
below centre, so fires tens of kilometres ahead stay on screen (ADR 023). Applied with
`map.setFreeCameraOptions`. Orbit offset from drag is added to the forward vector before placement.
The default framing draws the drone ~22.6 % of the view height below the centre of view (Mapbox's
36.87° vertical field of view; speed pull-back does not change it). A cockpit that would cover that
spot moves the centre of view with `map.setPadding`, which shifts the picture without changing the
camera pose. Only the phone landscape cockpit does this (§4.2); elsewhere the padding is zero.
`prefers-reduced-motion` disables orbit easing and bank animation.

### 4.1 Cockpit layout (ADR 021)

- **Top left:** FireflyBC wordmark, mode badge ("Ready", "Free flight", …), HUD notes.
- **Top centre:** search, with the offline banner and the location alert (§12) under it.
  **Top right:** the Location alerts button, then the install button. **Right:** fire panel
  (§7.1) with the selected fire's details card under it. **Bottom centre:** route banner.
- **Lower left, nav cluster:**
  - Compass rose, heading-up: the ring turns so the drone's heading is at the top, with N (red),
    E, S, W and 30° ticks. A fixed lubber line marks the heading, and the heading in degrees
    plus its compass point ("312° NW") sits under the rose.
  - Fire blips: a dot in the status colour on the ring at the bearing of each fire within
    150 km, bigger when closer.
  - Location: "Near {place}, {region}" from a Mapbox reverse geocode, looked up when the drone
    enters a new ~2 km cell. A cell is never looked up twice per session, so hovering costs
    nothing. It shows "Over British Columbia" while the first lookup runs or when it fails, and
    the coordinates (5 decimals, N/W) underneath.
  - Telemetry: speed (km/h), vertical speed (m/s, ▲/▼), altitude MSL and AGL.
- On a desktop browser narrower than 640 px, the nav cluster shows only the compass and the place
  name, and the fire panel starts collapsed to its "Active fires (N)" header.

### 4.2 Phone layouts (ADR 024)

A phone is a device whose primary pointer is coarse and whose short side is under 640 px. Tablets
and mouse/keyboard devices always get the cockpit of §4.1. The layout follows rotation live.

- **Portrait:** everything is collapsed. Top row: wordmark with mode badge, a search icon button
  (tapping it opens the search box; it collapses again when it loses focus while empty), the
  Location alerts icon button and the install icon. The offline banner and the location alert
  (§12) sit under the top row. The fire panel shows only its "Active fires (N)" header; the nav cluster shows only
  a small compass; the touch controls stay at the bottom. A notice at the centre says
  "Turn your phone sideways — FireflyBC works best in landscape" with **Continue in portrait**,
  which hides it for the rest of the session. Rotating to landscape removes it.
- **Landscape:** the §4.1 cockpit at a smaller size. Top: wordmark, search, the Location alerts
  and install icons, and the fire panel. The offline banner and the location alert (§12) sit at
  the top of the flight area. The fire panel starts **collapsed** to its "Active fires (N)"
  header so the flight area uses the full width. Opening it (or selecting a fire) turns the right side into a full-height
  column, narrower than on desktop, with the details card under the list; collapsing it gives the
  width back. Everything else sits in **one bottom bar**, so the middle of the screen stays clear:
  the move stick in the bottom-left corner, the compass and a compact place/telemetry card (no
  coordinates) centred between the sticks, then Boost and the climb slider at the bottom right of
  the flight area. When the bar is too narrow for the card (small phone with the fire list open),
  only the compass shows. The route banner sits just above the bar. The overlay keeps clear of
  notches (safe-area insets). The short viewport would otherwise draw the drone under the
  telemetry card, so the camera is padded (§4) to draw it three quarters of the way down the clear
  band between the top row and the centre instruments (compass and card), *(tunable:
  `LANDSCAPE_DRONE_BAND_RATIO` 0.75)*, about 25–60 px above them. The picture shifts up by ~60 px,
  so the horizon sits at or just above the top edge. The padding follows the measured row and
  instruments as they resize (rotation, safe areas, card hidden); opening the fire column does not
  change it.

## 5. Search → fly (ADR 008)

1. User focuses the search box (keyboard input to the drone is suspended). A Search Box session
   opens on first keystroke.
2. Suggestions are limited to BC (`bbox`, `country=ca`) and biased to the drone's position.
3. On selection, the retrieve feature is validated: must have `geometry.coordinates` inside the
   BC bbox; otherwise toast "That place is outside British Columbia" and nothing flies.
4. `flyToPlace({ name, lngLat })` is dispatched → mode `autoRoute`, destination stored, pushed
   to recents (last 10, persisted).
5. Search box blurs; drone control returns to the loop.

## 6. Auto-route

### 6.1 Path and speed

- Path: a planned polyline (≤ 256 points) from the current position to the destination. It starts
  as the great circle. Within a second the map widget replaces it with a terrain-aware curve
  (§6.2), as long as less than 20 % of the trip time has passed; otherwise the great circle stays.
  Progress is a distance along the polyline, and the route line draws the same polyline.
- Trip duration = `clamp(distance / CRUISE_MPS, MIN_TRIP_S, MAX_TRIP_S)` *(tunable: 400 m/s,
  5 s, 45 s)* with ease-in/ease-out, so Vancouver → Summerland (~300 km) takes ~45 s and the
  camera pulls back proportionally to speed so the ground is readable.
- Heading turns toward the path bearing at up to 180°/s with a visible bank. The bearing is taken
  toward a point slightly ahead on the polyline, so curves are flown as smooth banked turns.

### 6.2 Planned path and altitude profile (ADR 022, amends ADR 007)

Planning, in the map widget, when a route has no terrain-aware path yet:

```
corridor = route bbox + max lateral offset; DEM tiles (terrain-RGB) at the coarsest zoom ≤ 10
           that covers it in ≤ 12 tiles
candidates = quadratic Bézier curves origin → destination with the apex offset sideways by
             0, ±15 %, ±30 %, ±45 % of the distance (offset ≤ 40 km), sampled every ~1 km
score    = highest terrain on the curve + 0.05 × (curve length − straight length)
           -- a 1 km detour must avoid 50 m of terrain; the straight line wins ties
profile  = need(s) = highest terrain within ±1.5 km + CLEARANCE_M (300 m)
           envelope(s) = min(start + 25 % × s, cruise, end + 15 % × (L − s))
           cruise = max(start, end) + min(1500 m, 2 % × L);  end = destination ground + 300 m
           alt(s) = max(envelope, need) with climbs pulled ahead of ridges (25 % grade) and
           descents eased after them (15 % grade), then smoothed; ≤ CEILING_MSL_M
```

In flight, each step:

```
target = max(profile(s), max(known samples 0/1/3/6 km ahead) + CLEARANCE_M)  -- live safety net
altMsl = approach target, vertical rate ≤ max(120 m/s, 1.5 × profile slope × ground speed)
```

Without DEM tiles (offline, error or timeout after 10 s) the path stays the great circle and the
profile is the envelope with `end = start`; the live safety net still applies.

### 6.3 Null terrain samples

`queryTerrainElevation` returns `null` for unloaded tiles. Rules: ignore nulls in the max; if
**all** samples are null for > 2 s, hold the current altitude and raise the target by 100 m per
second until a sample returns (fail-safe upward); never descend on missing data. The HUD altitude
readout shows "—" for AGL while samples are missing.

### 6.4 Pause and resume

- Any drone input while in `autoRoute` → `paused` immediately. The drone keeps its velocity and
  responds to input; the route line stays drawn faded.
- Banner: "Paused — Resume flight to Summerland? [Resume] [Cancel]". Resume re-plans from the
  current position with the same destination (fresh duration and a fresh terrain-aware path).
  Cancel clears the route.
- While flying, the banner shows the destination, the distance left and the time left
  ("Flying to Summerland · 182 km · 0:31").
- Pausing does not change the camera model.

### 6.5 Arrival

Within `ARRIVAL_RADIUS_M` → `arrived`: velocity eases to zero, drone hovers at target altitude,
camera orbits at 10°/s. Arrival card: destination name, "Fires within 25 km: N (nearest: X, Y km,
status)". Any input or Dismiss → `freeFlight`.

## 7. Fires (ADR 003, 015)

- Fetch on launch, poll every 10 min, refetch on reconnect; 10 s timeout; paginated.
- HUD badge: "Fires: N · updated 4 min ago" (relative time ticks each minute). Over 30 min old
  (feed failing) → amber "Fire data may be stale"; over 2 h → red; never silently blank.
- Representation (ADR 023): a hit-test circle layer with the incident name as a haloed label.
  Under it is a scorched footprint draped on the terrain: the BCWS perimeter polygon when one
  exists, else a circle of the reported area (`r = √(ha × 10 000 / π)`, at least 60 m),
  marked "approximate area" in the popup. The footprint has a charred fill and an edge in the
  status colour. Floating over it is the `fire.glb` flame, scaled by status: out of control,
  new and Fire of Note 100 %, being held 60 %, under control 35 %, out none. The flame flickers
  unless motion is reduced. Its base height grows with fire size, and it never draws smaller than
  ~32 px tall, so fires stay visible and clickable from tens of kilometres away. A translucent
  ghost of each flame is drawn through the terrain, so a fire behind a ridge is still seen and
  clicked; where the fire is in view, the solid flame covers its ghost.
- Perimeters: fetched with the fire feed and polled every 10 min (`FIRE_STATUS<>'Out'`, simplified
  to ~50 m, ≤ 1000 features). A failed perimeter fetch only falls back to circles; it never
  hides fires.
- Hover (desktop) → cursor pointer + tooltip with name and status. Click/tap on the point or the
  flame **selects** the fire (never flies): its list row scrolls into view and is highlighted, and
  the details card opens under the fire list:
  fire number, incident name, status badge, size (ha), ignition date (local time), approximate
  location, cause, "Fly here" button, "Open on BC Wildfire Service ↗" (allow-listed host only).
- "Fly here" dispatches `flyToPlace` to the fire's coordinates.
- Filter: `Out` fires excluded by default; a HUD toggle "Show fires that are out" re-queries
  without the filter.
- Disclaimer in the popup footer: "Informational only. Source: BC Wildfire Service open data,
  fetched {time}. For emergencies follow EmergencyInfoBC."

### 7.1 Fire panel (ADR 021)

- A panel on the right: the feed badge, status chips (All · Out of control · Being held ·
  Under control · New, each with its count), the fire list, and the "Show fires that are out"
  toggle.
- Rows are sorted by distance from the drone (re-sorted on each ≤ 4 Hz snapshot). Each row
  shows the status swatch, the incident name, the size, the distance ("12.4 km"), and an arrow
  pointing to the fire relative to the drone's heading (up = straight ahead).
- Clicking a row selects the fire, the same as clicking its point or flame: the row highlights
  and the details card opens under the list. "Fly here" on the card, or the row's Fly button,
  dispatches `flyToPlace`. A fire selected on the map scrolls its row into view; if the active
  status chip hides it, the chip resets to All.
- Before the first snapshot, rows are sorted by name and show no distance. An empty filter
  shows "No fires match this filter".

## 8. Persistence

- `localStorage['fireflybc.drone.v1'] = { v: 1, lng, lat, altMsl, headingRad, savedAt }` written at
  most every 2 s while moving and on `pagehide` / `visibilitychange: hidden`.
- `localStorage['fireflybc.prefs.v1'] = { v: 1, recents: [...≤10], followDistanceM }`.
- `localStorage['fireflybc.quota.<api>.v1'] = { v: 1, day: 'YYYY-MM-DD', count }`: the Mapbox
  requests sent from this browser today, one key per budgeted API (§11).
- Invalid or outside-BC values are discarded with a `console.warn` via `reportError`.
- Nothing about the user's location is stored: not the position, not whether location alerts
  were on (§12.2).

## 9. Tunables (`src/shared/config/`)

| Constant | Default | File |
|---|---|---|
| `BC_BBOX` | `[-139.06, 48.30, -114.03, 60.00]` | `bc-bounding-box.ts` |
| `BC_CENTRE` | `[-122.75, 53.92]` | `bc-bounding-box.ts` |
| `DEFAULT_ALT_AGL_M` | 500 | `flight-tuning.ts` |
| `MAX_SPEED_MPS` / `BOOST_MULTIPLIER` | 150 / 4 | `flight-tuning.ts` |
| `CLEARANCE_M` / `MIN_AGL_M` | 300 / 30 | `flight-tuning.ts` |
| `CRUISE_MPS`, `MIN_TRIP_S`, `MAX_TRIP_S` | 400, 5, 45 | `flight-tuning.ts` |
| `ARRIVAL_RADIUS_M` | 150 | `flight-tuning.ts` |
| `FOLLOW_DISTANCE_M` / `FOLLOW_HEIGHT_M` | 60 / 25 | `camera-tuning.ts` |
| `FIRE_POLL_MS` | 600 000 | `fire-feed.ts` |
| `FIRE_STALE_WARN_MS` / `FIRE_STALE_ERROR_MS` | 1 800 000 / 7 200 000 | `fire-feed.ts` |
| `MAPBOX_REQUEST_LIMITS` (per minute / per day) | see §11 | `mapbox-request-limits.ts` |
| `LOCATION_ALERT` tier limits / position max age | 10 / 30 / 50 km, 60 s | `location-alert.ts` |

## 10. Edge cases and required behaviour

### Environment
| Case | Behaviour |
|---|---|
| No WebGL2 | Static message, no map, no loop |
| WebGL context lost | Loop pauses, overlay "Graphics context lost — restoring…"; on restore, layer re-added, state intact |
| Low-end device (< 30 fps for 5 s) | Beacon pulse disabled, DPR capped at 1.5, label layer hidden; HUD note "Reduced detail" |
| Tab hidden / backgrounded | rAF stops; on return `dt` clamp prevents teleport; fire poll timer continues (RTK Query) |
| Window blur with keys held | All keys released on `blur` and `visibilitychange` |
| Resize / orientation change | Map resizes; phone overlay switches portrait ↔ landscape (§4.2), its local widget state (search text, status chip) resets; camera, route and selection unaffected |
| 360 px wide phone, portrait | Collapsed layout and the rotate notice (§4.2) |
| Phone with orientation lock | "Continue in portrait" dismisses the notice for the session; the collapsed layout stays usable |

### Network and data
| Case | Behaviour |
|---|---|
| Offline at launch | Shell loads, offline banner, map blank with message, search shows recents only, no fires |
| Goes offline mid-flight | Drone keeps flying over already-loaded tiles; banner; fires remain; search disabled; terrain nulls follow §6.3 |
| Mapbox 401/403 (bad or rotated token, missing referer) | Overlay "Map unavailable (auth)" + developer hint in console; prompts reload if a newer SW is waiting |
| Mapbox 429 | Back-off handled by GL JS; HUD note if tiles stall > 10 s |
| BCWS feed down / 5xx / timeout | Keep last data; stale badge escalates; retry on next poll |
| BCWS returns 200 with `{error}` | Schema rejects; treated as feed error |
| BCWS schema change (missing field) | Zod fails → feed error, UI shows "Fire data unavailable", app keeps working |
| Unknown `FIRE_STATUS` value | Grey beacon, raw text shown |
| `exceededTransferLimit` on last page | Pagination loop continues until false; hard cap 10 pages |
| Fire with invalid coordinates / outside BC | Dropped during normalise with a counted warning |
| Duplicate `FIRE_NUMBER` | Last one wins; counted warning |
| Huge feed (> 10 MB) | `fetchJson` aborts; feed error |
| Search returns place outside BC | Toast; no flight |
| Search 429 / network error | Inline error in the box; drone unaffected |
| A Mapbox request budget is spent (§11) | No request is sent; the caller's normal failure path runs |

### Input and modes
| Case | Behaviour |
|---|---|
| Typing in search while flying | Drone input suspended; keys never reach the loop |
| Input during `autoRoute` | → `paused` (§6.4) |
| Resume when destination now equals current position | → `arrived` immediately |
| Destination at the bbox edge | Route planned; clamp keeps the drone inside; arrival radius check still succeeds |
| Esc during popup and route | Closes popup first; second Esc cancels route |
| Gamepad connected | Ignored in MVP |

### Geometry and simulation
| Case | Behaviour |
|---|---|
| Crossing high latitude (60° N) | Geodesic maths; mercator scale applied per frame when converting to scene units |
| Very short route (< 300 m) | Duration = `MIN_TRIP_S`; no banking turn |
| Terrain sample null forever (DEM blocked) | Fail-safe upward (§6.3); drone never clips |
| Altitude above 12 000 m | Clamped; HUD shows ceiling |
| Saved position corrupt / outside BC | Default spawn; warning |
| Drone GLB fails to load | Wireframe placeholder stays; error reported; everything else works |
| Drone GLB wrong orientation/scale | Corrected by constants in `entities/drone/config/drone-model.ts` (spike item) |

### PWA and lifecycle
| Case | Behaviour |
|---|---|
| New version deployed | SW `autoUpdate`; toast "Updated — reload" when the new SW is waiting; auto-reload only when a Mapbox 401 suggests a rotated token |
| Install prompt | Shown via HUD button when `beforeinstallprompt` fires; never auto-prompt |
| Storage quota error | Persistence silently disabled for the session; warning |

### Security-relevant (details in `docs/security.md`)
| Case | Behaviour |
|---|---|
| Feed text contains HTML/script | Rendered as text by React; never HTML |
| `FIRE_URL` host not allow-listed | Link omitted; fire number shown as text |
| Token missing at build | Build fails (`env.ts` validation at startup, `check-no-secrets` prevents committing one) |

### Location alerts (§12)
| Case | Behaviour |
|---|---|
| User denies location (or the browser blocks it) | No alert; "Location alerts need your location…" message with a close button; everything else works |
| No Geolocation API, or no position before the first fix | No alert; "Your location isn't available…" message with a close button |
| Position error after a fix | Keep the last position; the watch continues |
| Browser returns an invalid position (non-finite or out of range) | Ignored with a warning that contains no coordinates |
| Fire feed loading with no data yet | "Checking for fires near you…" |
| Fire feed failed with no data | "Location alerts can't check fires right now: fire data is unavailable." |
| Fire feed stale (keeps last data) | Alert continues from the last data; the source note shows the fetch time |
| Nearest fire is `Out` | Ignored; the nearest fire that is not `Out` counts |
| "Show fires that are out" toggle on | No effect on the alert |
| No active fire within 50 km, or none at all | No alert; the pressed Location alerts button shows alerts are on |
| Nearest distance crosses a limit (e.g. 32 km → 28 km) | Tier and action change in place (Aware → Prepare) |
| User outside BC | Same rules; distances to BC fires still apply |
| Location alerts turned off | Watch stopped, position forgotten, alert and messages hidden |
| Phone rotated | Alert and tracking continue; the position is kept; the alert's details close |
| Page reload or close | Position forgotten; alerts start off again |

## 11. Mapbox request budgets (ADR 025)

Every Mapbox API call the app makes itself is counted against a budget before it is sent: a
sliding one-minute window (per tab) and a daily cap (per browser, local date, persisted). Map loads
and GL JS tile requests are not budgeted: the map is created once per page load.

| API | Per minute | Per day | Over budget |
|---|---|---|---|
| Search Box suggest | 30 | 300 | Inline "Search limit reached — try again in a minute." (or "…today on this device. Recent places still work.") |
| Search Box retrieve | 10 | 50 | Toast "Search limit reached — try again later."; nothing flies |
| Geocoding v6 reverse | 20 | 1 000 | Place name keeps its last value or "Over British Columbia"; retried after 60 s |
| Terrain-DEM tiles | 48 | 480 | The whole batch is refused up front; the route keeps the great circle (§6.2) |

All numbers are *(tunable)*. A batch (DEM tiles) is allowed only if all of it fits; it never
spends part of a budget.

## 12. Location alerts (ADR 027)

An early warning about the active fire nearest to the user's own location. It is never an
evacuation authority.

### 12.1 Turning it on and off

- Off at launch. A **Location alerts** toggle button (location icon; icon only on phones) sits
  before the install button. It shows as pressed while alerts are on. Pressing it turns alerts on
  for this session; pressing it again turns them off.
- Turning on starts `navigator.geolocation.watchPosition` with low accuracy, accepting positions
  up to 60 s old *(tunable)*. The browser asks for permission the first time and remembers the
  answer; FireflyBC does not.
- While waiting for the first position, the banner reads "Finding your location…".
- Permission denied (or blocked by the browser): "Location alerts need your location. Allow
  location for this site in your browser settings, then turn them on again." with a close button.
  No alert; the rest of the app is unaffected.
- No Geolocation API, or a position error before the first fix: "Your location isn't available
  in this browser, so location alerts are off." with a close button.
- A position error after a fix keeps the last position; the watch continues.
- Turning off stops the watch and forgets the position. Closing a message turns alerts off.

### 12.2 Privacy

- The position is held in memory (Redux) for this session only. FireflyBC never writes it to
  storage, never sends it to any server, never puts it in a URL and never logs it. A reload
  forgets it.
- Each position from the browser is validated with zod (finite, longitude −180…180, latitude
  −90…90). An invalid one is ignored with a warning that contains no coordinates.
- The browser's own location service is outside the app's control.

### 12.3 Nearest fire and tier

On every position update and every fire feed response:

```
active  = fires whose status is not Out (the "Show fires that are out" toggle has no effect)
nearest = the active fire with the smallest haversine distance from the user to its reported point
tier    = distance < 10 km -> Ready to leave
          distance < 30 km -> Prepare
          distance < 50 km -> Aware
          otherwise        -> no alert
```

The limits are *(tunable)*. Exactly 10 km is Prepare; exactly 50 km is no alert. The fire feed's
fetching and polling (§7) are unchanged; the alert reads the same feed.

### 12.4 The alert

- Placed under the search with the offline banner (§4.1, §4.2), as a panel card.
- Content: the tier name; "Nearest active fire: {name}, {d.d} km from you"; the tier's action:

| Tier | Colour | Action |
|---|---|---|
| Ready to leave | red | Check evacuation orders now and be ready to go. |
| Prepare | amber | Pack a go-bag, check official alerts and keep watching. |
| Aware | neutral | Nothing to do, just monitoring. |

- Ready to leave is announced assertively (`role="alert"`); the others politely.
- Actions: **Show fire** selects the fire (the same as clicking it, §7); "Evacuation orders and
  alerts ↗" opens EmergencyInfoBC; "BC Wildfire Service map ↗" opens the BCWS map. Both links
  open in a new tab with `rel="noopener noreferrer"`.
- Note under it, in the fire popup's style: "Early warning only: straight-line distance to the
  fire's reported location, not its edge. Not an evacuation order; orders and alerts come from
  local authorities and First Nations. Source: BC Wildfire Service open data, fetched {time}.
  For emergencies follow EmergencyInfoBC."
- The alert has no dismiss. It changes in place when the tier changes, and disappears only when
  no active fire is within 50 km or alerts are turned off.
- Feed states: no data yet → "Checking for fires near you…"; failed with no data → "Location
  alerts can't check fires right now: fire data is unavailable."; stale → keeps alerting from the
  last data.
- Phones: a narrower card with smaller text showing the tier, the fire and distance, the action
  and "Early warning only. Not an evacuation order." A **Show alert details** button opens Show
  fire, the links and the full note; rotating the phone closes them again. If the banners would
  push the flight controls off-screen, the banner area scrolls instead.
