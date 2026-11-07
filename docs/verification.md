# Verification of the edge cases

Every row of `docs/behaviour.md` §10 with what checks it (ADR 026, roadmap Phase 7). Unit test
paths are under `src/`; Playwright specs are under `e2e/`. "Manual" rows are checked by the owner
on production, then logged at the bottom of this file. Mapped on 2026-11-07 against 555 unit tests
in 149 files and 7 Playwright specs.

## Environment

| Case | Automated test | Manual check |
|---|---|---|
| No WebGL2 | `shared/lib/browser/is-webgl2-supported.test.ts` (detection only) | **Needed.** Open with WebGL disabled (Firefox `webgl.disabled = true`). The static message shows; no map. |
| WebGL context lost | — | **Needed.** In the console: `const x = document.querySelector('canvas.mapboxgl-canvas').getContext('webgl2').getExtension('WEBGL_lose_context'); x.loseContext();` The overlay shows. Then `x.restoreContext()`: drone, fires and route come back. |
| Low-end device | `widgets/map-view/lib/sample-frame-rate.test.ts`, `shared/lib/browser/clamp-device-pixel-ratio.test.ts` | **Needed.** DevTools CPU throttling 6×. After about 5 s the HUD shows "Reduced detail" and the labels hide. |
| Tab hidden / backgrounded | — (the 50 ms `dt` clamp in `widgets/map-view/model/run-frame-loop.ts` has no unit test) | **Needed.** Fly forward, switch tabs for 30 s, come back. The drone does not jump. |
| Window blur with keys held | — | **Needed.** Hold W, switch window, release W, come back. The drone drifts to a stop. |
| Resize / orientation change | `shared/lib/browser/use-viewport-layout.test.tsx`; `e2e/phone-layouts.spec.ts` | Not needed. |
| 360 px wide phone, portrait | `e2e/phone-layouts.spec.ts` (at 412 px) | **Needed.** DevTools device mode at 360 × 800: collapsed layout and the rotate notice. |
| Phone with orientation lock | `pages/map-page/ui/rotate-device-notice.test.tsx`; `e2e/phone-layouts.spec.ts` | Not needed. |

## Network and data

| Case | Automated test | Manual check |
|---|---|---|
| Offline at launch | `shared/lib/browser/use-online-status.test.tsx` (status only) | **Needed.** After one visit, DevTools Network "Offline", reload. Banner, map message, recents only, no fires. |
| Goes offline mid-flight | — | **Needed.** Fly, then go "Offline". The drone keeps flying over loaded tiles, the banner shows, fires stay, search is disabled. |
| Mapbox 401/403 | — | **Needed.** Run locally with `VITE_MAPBOX_TOKEN=pk.invalid`. The overlay says "Map unavailable (auth)". |
| Mapbox 429 | — | Cannot be forced by hand; GL JS backs off. Review `widgets/map-view/model/track-map-health.ts` only. |
| BCWS feed down / 5xx / timeout | `shared/api/fetch-json.test.ts`, `widgets/fire-panel/lib/read-fire-freshness.test.ts` | Not needed. |
| BCWS returns 200 with `{error}` | `entities/fire/model/fire.schema.test.ts`, `shared/api/fetch-json.test.ts`, `entities/fire/api/fetch-active-fires.test.ts` | Not needed. |
| BCWS schema change | `entities/fire/model/fire.schema.test.ts`, `widgets/fire-panel/lib/read-fire-freshness.test.ts` | Not needed. |
| Unknown `FIRE_STATUS` | `entities/fire/lib/normalize-fire-status.test.ts`, `entities/fire/lib/normalize-fire-features.test.ts`, `widgets/map-view/lib/build-fire-points.test.ts` | Not needed. |
| `exceededTransferLimit` on last page | `entities/fire/api/fetch-active-fires.test.ts` | Not needed. |
| Fire with invalid coordinates / outside BC | `entities/fire/lib/normalize-fire-features.test.ts` | Not needed. |
| Duplicate `FIRE_NUMBER` | `entities/fire/lib/normalize-fire-features.test.ts` | Not needed. |
| Huge feed (> 10 MB) | `shared/api/fetch-json.test.ts` | Not needed. |
| Search returns place outside BC | `widgets/search-bar/lib/to-retrieved-place.test.ts` | Toast only: rare through the UI because suggestions are limited to BC. Review only. |
| Search 429 / network error | `widgets/search-bar/lib/read-search-limit-message.test.ts` (budget messages) | **Needed.** DevTools "Block request URL" for `*search/searchbox*`, then type. Inline error; the drone is unaffected. |
| A Mapbox request budget is spent | `shared/lib/rate-limit/create-request-budget.test.ts`, `shared/api/fetch-json.test.ts`, `widgets/search-bar/lib/read-search-limit-message.test.ts` | Not needed. |

## Input and modes

| Case | Automated test | Manual check |
|---|---|---|
| Typing in search while flying | `features/control-drone/lib/is-typing-target.test.tsx` | Not needed. |
| Input during `autoRoute` | `entities/drone/model/drone-mode.slice.test.ts` | Not needed. |
| Resume when destination equals current position | `features/pause-resume-route/model/resume-route.test.ts` | Not needed. |
| Destination at the bbox edge | `entities/drone/lib/clamp-to-british-columbia.test.ts` (clamp only) | **Needed.** Fly to a destination within 5 km of the BC bounding box edge. The arrival card shows. |
| Esc during popup and route | `e2e/fire-popup.spec.ts` (first Esc closes the popup) | **Needed.** Start a route, open a fire, press Esc twice. The popup closes, then the route cancels. |
| Gamepad connected | None needed: nothing in `src` reads `navigator.getGamepads`. | Not needed. |

## Geometry and simulation

| Case | Automated test | Manual check |
|---|---|---|
| Crossing high latitude (60° N) | `shared/lib/geo/compute-mercator-units-per-meter.test.ts`, `shared/lib/geo/project-to-mercator.test.ts`, `shared/lib/geo/compute-destination-point.test.ts`, `entities/drone/lib/clamp-to-british-columbia.test.ts` | Not needed. |
| Very short route (< 300 m) | `entities/route/lib/compute-trip-duration.test.ts`, `entities/route/lib/build-candidate-paths.test.ts` | Not needed. |
| Terrain sample null forever | `entities/terrain/lib/compute-terrain-floor.test.ts` (all-null case). The upward fail-safe in `widgets/map-view/model/step-auto-route.ts` has no unit test. | **Needed.** Block `*terrain-dem*` in DevTools, reload, start a route. AGL shows "—"; the drone climbs and never clips. |
| Altitude above 12 000 m | `entities/drone/lib/step-free-flight.test.ts`, `entities/drone/lib/restore-drone-spawn.test.ts` | Optional: hold Space to the ceiling; the HUD shows it. |
| Saved position corrupt / outside BC | `entities/drone/lib/restore-drone-spawn.test.ts`, `shared/lib/storage/read-versioned-item.test.ts`, `entities/drone/model/saved-drone-state.schema.test.ts` | Not needed. |
| Drone GLB fails to load | — | **Needed.** Block `/models/drone.glb`. The wireframe placeholder stays; everything else works. |
| Drone GLB wrong orientation/scale | — | **Needed.** Visual: the nose leads in flight and the size looks right at the default follow distance. |

## PWA and lifecycle

| Case | Automated test | Manual check |
|---|---|---|
| New version deployed | `shared/lib/pwa/pwa-status-source.test.ts`, `shared/lib/pwa/use-pwa-status.test.tsx` | **Needed.** Keep a tab open across a deploy. The "Updated — reload" toast shows. |
| Install prompt | `shared/lib/pwa/pwa-status-source.test.ts`; `e2e/manifest.spec.ts` | **Needed.** Lighthouse reports the app installable; the HUD install button works; no automatic prompt. |
| Storage quota error | `shared/lib/storage/write-versioned-item.test.ts` | Not needed. |

## Security-relevant

| Case | Automated test | Manual check |
|---|---|---|
| Feed text contains HTML/script | `entities/fire/lib/normalize-fire-features.test.ts`, `widgets/fire-popup/ui/fire-details-card.test.tsx`, `widgets/search-bar/lib/to-retrieved-place.test.ts` | Not needed. |
| `FIRE_URL` host not allow-listed | `entities/fire/lib/parse-incident-url.test.ts`, `widgets/fire-popup/ui/fire-details-card.test.tsx` | Not needed. |
| Token missing at build | `shared/config/env.test.ts`; `scripts/convention-checks/find-secrets.test.ts` | Not needed. |

## Location alerts (ADR 027)

| Case | Automated test | Manual check |
|---|---|---|
| User denies location (or the browser blocks it) | `widgets/location-alert/ui/location-alert.test.tsx`, `features/track-user-location/model/use-user-location-tracking.test.tsx`; `e2e/location-alert.spec.ts` | **Needed.** On production, press Location alerts and block the prompt: the message shows. Then allow it in site settings and press again: the alert or nothing shows, never the message (proves `Permissions-Policy: geolocation=(self)` is live). |
| No Geolocation API, or no position before the first fix | `entities/user-location/api/track-user-position.test.ts`, `features/track-user-location/model/use-user-location-tracking.test.tsx`, `widgets/location-alert/lib/read-location-alert-view.test.ts` | Not needed. |
| Position error after a fix | `entities/user-location/model/user-location.slice.test.ts` | Not needed. |
| Browser returns an invalid position | `entities/user-location/api/track-user-position.test.ts`, `entities/user-location/model/user-position.schema.test.ts` | Not needed. |
| Fire feed loading with no data yet | `widgets/location-alert/lib/read-location-alert-view.test.ts` | Not needed. |
| Fire feed failed with no data | `widgets/location-alert/lib/read-location-alert-view.test.ts` | Not needed. |
| Fire feed stale (keeps last data) | `widgets/location-alert/lib/read-location-alert-view.test.ts` (alerts from the cached snapshot with its fetch time) | Not needed. |
| Nearest fire is `Out` | `entities/fire/lib/find-nearest-active-fire.test.ts`, `widgets/location-alert/lib/read-location-alert-view.test.ts` | Not needed. |
| "Show fires that are out" toggle on | `entities/fire/lib/find-nearest-active-fire.test.ts` (`Out` is skipped whatever the feed holds) | Not needed. |
| No active fire within 50 km, or none at all | `widgets/location-alert/lib/read-location-alert-view.test.ts`, `widgets/location-alert/ui/location-alert.test.tsx` | Not needed. |
| Nearest distance crosses a limit (32 km → 28 km) | `widgets/location-alert/lib/get-proximity-tier.test.ts`, `widgets/location-alert/lib/read-location-alert-view.test.ts`, `widgets/location-alert/ui/location-alert.test.tsx`; `e2e/location-alert.spec.ts` (4.2 km → 20.3 km on a move) | Not needed. |
| User outside BC | — (same haversine path; nothing checks the user against the BC box) | Optional: set a DevTools sensor location in Alberta near the border; distances still show. |
| Location alerts turned off | `entities/user-location/model/user-location.slice.test.ts`, `features/track-user-location/model/use-user-location-tracking.test.tsx`, `widgets/location-alert/ui/location-alert.test.tsx` | Not needed. |
| Phone rotated | — (the watch lives in `pages/map-page`, which rotation does not remount) | **Needed.** On a phone, turn alerts on, rotate twice. The alert stays and "Finding your location…" does not come back. |
| Page reload or close | — | **Needed.** With alerts on, check DevTools: Local Storage has no position, and no request URL or body carries your coordinates. Reload: alerts are off. |

## Summary

57 rows: 33 fully covered by automated tests, 20 need a manual check, 4 are review only or
optional (Mapbox 429, search result outside BC, altitude ceiling display, user outside BC).

## Manual check log

| Date | URL / build | Browser and device | Rows checked | Result | Notes |
|---|---|---|---|---|---|
| — | — | — | — | — | — |
