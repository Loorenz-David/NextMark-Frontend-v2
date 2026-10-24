# 11 — Touch drag intent: hold with a clear cue, or press-pause-move (Phase 2b)

**Created:** 2026-10-24. **Status:** approved by the user 2026-10-24 — options 1 (long press with a clear pick-up cue) and 4 (slow deliberate movement starts a drag, a flick scrolls). Direction-based intent was **rejected**: route stops are reordered up and down inside lists that also scroll up and down, so direction cannot tell the two apart. Branch `ipad/phase-2b-touch-intent` (stacked on 5b; it carries the temporary dev logger commit `0bae682`).

Paths relative to `Front_end/admin-app/src`.

---

## 1. Evidence (Chrome iPad mini emulation, dev logger, 2026-10-24)

Failed attempts — finger moved before the 250 ms hold:

```
+0ms    touchstart  on .dnd-touch-source (draggable), touch-action: manipulation
+159ms  touchmove   cancelable: true,  defaultPrevented: false   ← dnd-kit TouchSensor: moved > 8px before delay → cancels
+160ms  pointercancel                                            ← browser takes the gesture as a pan
+170ms… touchmove   cancelable: false                             ← nothing can claim it any more
        touchend, no dnd:start
```

Successful attempt — finger held still:

```
+0ms    touchstart
+253ms  dnd:start   activator: touchstart
+670ms  selectstart, contextmenu (defaultPrevented: false)       ← long press side effects; must be blocked
+1048ms touchmove   cancelable: true, defaultPrevented: true      ← dnd-kit owns the gesture
        dnd:move …, dnd:end
```

Two facts drive the design:

1. **There is exactly one decision point**: the first `touchmove` that leaves the tolerance radius. It is still `cancelable`; if it is not `preventDefault()`-ed, the browser starts panning (`pointercancel`) and every later move is non-cancelable. The decision must be made synchronously on that event.
2. Nothing tells the user *when* the card is ready, so they move too early. The hold itself is not the problem; the missing feedback is.

## 2. Behaviour

A touch on a draggable goes through one gesture state machine:

| Phase | What the user sees | Leaves when |
|---|---|---|
| **pending** (finger down, within `tolerancePx`) | after `pressCueDelayMs`, the card starts a gentle squeeze (`scale` 1 → 0.97 over the rest of the hold) — "keep holding" | hold timer fires → **active**; finger leaves the radius → **decide**; touchend/touchcancel/scroll → **aborted** |
| **decide** (first move outside `tolerancePx`, before the hold completed) | — | `elapsedMs ≥ minDwellMs` **and** `recentSpeed ≤ maxStartSpeedPxPerMs` **and** `event.cancelable` → **active** (and `preventDefault()` this move); otherwise → **aborted** (do not prevent; the browser scrolls) |
| **active** (drag running) | the floating preview "lifts" in: scale 0.97 → 1.03 → 1, stronger shadow, accent ring, for ~160 ms; settings sortables (no overlay) get the same lift on the item | touchend → end; touchcancel / Esc / resize / visibility hidden → cancel |
| **aborted** | squeeze released instantly | — |

- **Hold path (option 1):** finger still for `holdMs` → drag starts with the lift cue. Works in every direction, including route-stop reordering.
- **Press-pause-move path (option 4):** finger rests at least `minDwellMs`, then moves off slowly → drag starts at once, without waiting for the full hold. A flick (moves off quickly or almost immediately) is a scroll. Direction plays no part.
- `recentSpeed` is the finger speed over the last `recentWindowMs` of samples (px/ms), not the average since touchdown, so "rest, then flick" still scrolls.
- While pending or active: block `contextmenu`, `selectstart` and native `dragstart` (preventDefault), so a long press never opens the iOS callout or selects text.
- After activation: stop the `click` that follows the drag (capture listener on document, removed 50 ms after detach — same as dnd-kit).
- A `scroll` event anywhere while **pending** aborts the gesture (the browser decided it is a scroll).

### Starting values (tune on the iPad, record final values in `08`)

| Constant | Value | Why |
|---|---|---|
| `holdMs` | 220 | a bit faster than today's 250; still clearly a hold |
| `tolerancePx` | 8 | unchanged; under iOS's own pan slop, so we decide before Safari does |
| `minDwellMs` | 120 | shorter than this is a flick start, not a deliberate press |
| `maxStartSpeedPxPerMs` | 0.8 | ≈ 800 px/s; deliberate drags start slower, scroll flicks faster |
| `recentWindowMs` | 50 | last few touch samples |
| `pressCueDelayMs` | 80 | taps and fast scrolls never flash the squeeze |

## 3. Implementation

### 3.1 Pure state machine — `shared/dnd/domain/touchDragIntent.ts`

No DOM, no dnd-kit imports. Exports:

- `TOUCH_DRAG_INTENT_DEFAULTS` (the table above) and type `TouchDragIntentConfig`.
- `type TouchSample = { t: number; x: number; y: number }`.
- `createTouchDragIntent(config, start: TouchSample)` returning an object with
  - `move(sample, cancelable): { effect: 'none' | 'activate' | 'abort' | 'drag-move'; preventDefault: boolean }`
  - `holdElapsed(t): { effect: 'none' | 'activate' }`
  - `phase(): 'pending' | 'active' | 'aborted'`
  - plus the numbers behind the last decision (`elapsedMs`, `distancePx`, `recentSpeed`) for the debug log.
- `recentSpeed(samples, windowMs)` helper (exported for tests).

### 3.2 Sensor — `shared/dnd/PressIntentTouchSensor.ts`

A custom dnd-kit sensor written against the **public** sensor contract (`SensorProps`, `SensorInstance`, static `activators`, static `setup`) from `@dnd-kit/core` 6.3.1. **Do not extend `TouchSensor`/`AbstractPointerSensor`**: their members are `private` in the type definitions.

- `static activators = [{ eventName: 'onTouchStart', handler }]`: single touch only (`touches.length === 1`), otherwise `false`; call `options.onActivation?.({ event })`; return `true`.
- `static setup()`: the same non-passive `touchmove` no-op listener `TouchSensor.setup` adds (required for `preventDefault` to work in iOS Safari).
- Constructor: create the state machine from the touchstart sample; attach `touchmove` (`passive: false`), `touchend`, `touchcancel` on the event target (touch events stay bound to the start target); window `contextmenu`/`selectstart`/`dragstart` → `preventDefault`, `resize`/`visibilitychange` → cancel, `keydown` Esc → cancel; document `scroll` (capture, passive) → abort while pending. Start the hold timer and the cue timer. Call `props.onPending(active, { delay: holdMs, tolerance: tolerancePx }, initialCoordinates)`.
- Effects: `activate` → `props.onStart(initialCoordinates)` then (if from a move) `props.onMove(current)`; `drag-move` → `preventDefault` + `props.onMove`; `abort` → detach, `props.onAbort(active)`, `props.onCancel()`; touchend → detach, `onAbort` if never active, `props.onEnd()`.
- `autoScrollEnabled = true`.
- **Cue:** the sensor sets `data-touch-drag="pressing"` on `props.activeNode.node.current` when the cue timer fires, `"active"` on activation, and removes the attribute on abort/end/cancel. The sensor owns the attribute so every draggable gets the cue without per-component wiring.
- **Debug:** optional `options.onIntentDecision?(info)`; the hook in §3.3 wires it to `window.__dndDebug?.push('intent', info)` in dev only.

### 3.3 One sensor hook — `shared/dnd/useAppDragSensors.ts`

`useAppDragSensors()` returns `useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 6 } }), useSensor(PressIntentTouchSensor, { config: TOUCH_DRAG_INTENT_DEFAULTS, onIntentDecision }))`. Replace the four hand-written sensor setups with it (re-grep first):

- `features/plan/hooks/usePlanOrderDndController.tsx` (home: orders, groups, batch, route stops)
- `features/itemConfigurations/pages/ItemStatesPage.tsx`
- `features/clientFormConfig/components/ClientFormMediaPlacementGroup.tsx`
- `features/clientFormConfig/pages/ClientFormRulesPage.tsx`

Mouse behaviour is unchanged.

### 3.4 Cue styles — `index.css`, next to `.dnd-touch-source`

```css
@media (pointer: coarse) {
  [data-touch-drag="pressing"] { scale: 0.97; transition: scale 140ms ease-out; }
  [data-touch-drag="active"]   { scale: 1.03; box-shadow: var(--shadow-panel-overlay-strong); }
}
@keyframes touch-drag-lift { 0% { scale: 0.97; } 60% { scale: 1.03; } 100% { scale: 1; } }
```

Use the individual `scale` property, never `transform`: dnd-kit and sortable items set `transform` inline, and `scale` composes with it. In `home-route-operations/components/RouteOperationsDragOverlay.tsx`, add the lift (keyframes, ~160 ms, plus shadow and accent ring through existing theme tokens) to the coarse-pointer preview wrapper. Keep the Phase 2 offset. Respect `prefers-reduced-motion` (no scale animation; keep the shadow and ring).

### 3.5 Tests (vitest) — `shared/dnd/domain/touchDragIntent.vitest.test.ts`

- Hold: no move, `holdElapsed(220)` → `activate`; `holdElapsed(219)` → `none`.
- Tiny drift within 8px never decides; it stays pending.
- Flick: leaves the radius at 60 ms → `abort`, `preventDefault: false`.
- Press-pause-move: leaves the radius at 150 ms with recent speed 0.3 → `activate`, `preventDefault: true`.
- Rest-then-flick: with `holdMs: 400` (so the hold has not fired), leaves the radius at 300 ms with recent speed 1.5 → `abort`.
- Non-cancelable move outside the radius → `abort`, whatever the timing.
- After `activate`, moves → `drag-move` with `preventDefault: true`; after `abort`, everything → `none`.
- `recentSpeed` handles one sample, equal timestamps and an empty window without dividing by zero.

## 4. Acceptance

- Gates green: lint 0 errors, tests, build, popup contract, theme regression, PWA checks, `git diff --check`.
- `grep -rn "TouchSensor" src --include=*.tsx` → only `PressIntentTouchSensor` users remain.
- Chrome emulation with the dev logger (`intent` entries show elapsed, distance, recent speed and the decision): hold path, press-pause-move path and flick path each behave as in §2.
- Device rows `07` B16–B20 on the iPad.
- Desktop E1–E3: mouse drag unchanged.

## 5. Known trade-off (accepted)

Someone who rests a finger on a card for more than 120 ms and then scrolls *slowly* will pick the card up rather than scroll. The squeeze cue and the lift make that obvious at once, and dropping on no target must change nothing (verify in the home `onDragEnd` path; the logged test drop ended with `over: null`). If this turns out to be common on the iPad, raise `minDwellMs` or lower `maxStartSpeedPxPerMs` (one constant each).
