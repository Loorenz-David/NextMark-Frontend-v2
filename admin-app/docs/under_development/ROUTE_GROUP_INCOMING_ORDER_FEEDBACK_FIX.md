# Route Group Incoming Order Feedback — Fix Plan

## Root Cause Analysis

There are two distinct bugs creating the observed behaviour. They must both be fixed.

---

### Bug 1 — Spurious animation on plan open (presence model vs event model)

The pulse store holds a **token string** per route group that lives for 4 200 ms. The avatar fires its animation whenever that token is non-null.

The failure sequence:

1. Batch A completes, `triggerIncomingRouteGroupPulse(routeGroupId)` writes `token-A` for route group 5. The 4 200 ms auto-clear timer starts.
2. **Within those 4 200 ms**, the user opens the target plan. The `DroppableRouteGroupRailAvatar` component mounts.
3. On mount, `useIncomingRouteGroupPulseToken` returns `"token-A"` (non-null, still in store).
4. `useEffect([incomingPulseToken])` fires immediately — it sees a non-null value and sets `isIncomingPulseActive = true`.
5. The animation plays on mount, before the new batch response has arrived.
6. When the new batch response eventually arrives and `triggerIncomingRouteGroupPulse` fires a new `token-B`, the avatar does react — but the user has already seen an animation and may not register the second one as meaningful. The experience is broken.

**Why the placeholder cards don't have this problem:** they represent current state (render while pending, disappear when done). The pulse animation is an event (fire once, after response, for the component that is mounted at that moment). These require different models.

**The `AdminNotificationsTrigger` comparison:** That component solves this correctly. It tracks `previousNotificationIdRef` and only fires the animation when the ID *changes* from a non-null baseline to a different non-null value. It never fires on mount even if the latest notification ID is already non-null. This is the pattern to follow.

---

### Bug 2 — Fill bar animates on every mount (Framer Motion missing `initial`)

The fill height `motion.span` inside the avatar has no `initial` prop:

```tsx
<motion.span
  animate={{ height: fillHeight }}
  transition={{ duration: 0.35, ease: "easeOut" }}
  ...
/>
```

Framer Motion with no `initial` prop animates from the DOM's natural starting state (height 0 for a newly mounted element) to the `animate` value. So every time the user opens a route plan, all avatars visually fill upward from 0%. This looks like an intentional attention animation to the user and contributes to the false-positive perception.

---

## Fix — Three files change

### File 1: `routeGroupIncomingPulse.store.ts`

Replace the presence/token model with a **monotonic sequence counter** per route group. No auto-clear timeout. No token lifecycle management.

```typescript
// admin-app/src/features/plan/routeGroup/store/routeGroupIncomingPulse.store.ts

import { create } from "zustand";

type RouteGroupIncomingPulseState = {
  sequenceByRouteGroupId: Record<number, number>;
  triggerPulse: (routeGroupId: number | null | undefined) => void;
};

const normalizeRouteGroupId = (routeGroupId: number | null | undefined) =>
  typeof routeGroupId === "number" &&
  Number.isFinite(routeGroupId) &&
  routeGroupId > 0
    ? routeGroupId
    : null;

export const useRouteGroupIncomingPulseStore =
  create<RouteGroupIncomingPulseState>((set) => ({
    sequenceByRouteGroupId: {},
    triggerPulse: (routeGroupId) => {
      const normalized = normalizeRouteGroupId(routeGroupId);
      if (!normalized) return;
      set((state) => ({
        sequenceByRouteGroupId: {
          ...state.sequenceByRouteGroupId,
          [normalized]: (state.sequenceByRouteGroupId[normalized] ?? 0) + 1,
        },
      }));
    },
  }));

export const triggerIncomingRouteGroupPulse = (
  routeGroupId: number | null | undefined,
) => useRouteGroupIncomingPulseStore.getState().triggerPulse(routeGroupId);

export const useIncomingRouteGroupPulseSequence = (
  routeGroupId: number | null | undefined,
) =>
  useRouteGroupIncomingPulseStore((state) => {
    const normalized = normalizeRouteGroupId(routeGroupId);
    if (!normalized) return 0;
    return state.sequenceByRouteGroupId[normalized] ?? 0;
  });
```

Key differences from the previous implementation:
- No `addPulse` / `removePulse` / `activeTokenByRouteGroupId`.
- No `window.setTimeout` inside the store.
- No token strings — just an integer counter.
- `triggerIncomingRouteGroupPulse` public API is unchanged (same name, same parameters).
- The selector is renamed from `useIncomingRouteGroupPulseToken` to `useIncomingRouteGroupPulseSequence` and returns a number.

---

### File 2: `DroppableRouteGroupRailAvatar.tsx`

Update to use the new selector and pass `pulseSequence` instead of `incomingPulseToken`.

```tsx
// admin-app/src/features/plan/routeGroup/components/routeGroupRail/DroppableRouteGroupRailAvatar.tsx

import { useDroppable } from "@dnd-kit/core";

import { useDroppableRouteGroupTargetHighlight } from "@/features/plan/dnd/controllers/useDroppableTargetHighlight.controller";
import { useIncomingRouteGroupPulseSequence } from "@/features/plan/routeGroup/store/routeGroupIncomingPulse.store";

import { RouteGroupRailAvatar } from "./RouteGroupRailAvatar";
import type { RouteGroupRailItem } from "./types";

type Props = {
  item: RouteGroupRailItem;
  onClick: (item: RouteGroupRailItem) => void;
};

export const DroppableRouteGroupRailAvatar = ({ item, onClick }: Props) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `route_group_rail-${item.route_group_id}`,
    data: {
      type: "route_group_rail",
      routeGroupId: item.route_group_id,
    },
  });
  const shouldHighlightDropTarget = useDroppableRouteGroupTargetHighlight({
    isOver,
    targetRouteGroupId: item.route_group_id,
  });
  const pulseSequence = useIncomingRouteGroupPulseSequence(
    item.route_group_id,
  );

  return (
    <div ref={setNodeRef}>
      <RouteGroupRailAvatar
        item={item}
        onClick={onClick}
        isDropTarget={shouldHighlightDropTarget}
        pulseSequence={pulseSequence}
      />
    </div>
  );
};
```

---

### File 3: `RouteGroupRailAvatar.tsx`

Two changes:

**A) Replace the `incomingPulseToken` prop with `pulseSequence` and update the effect.**

The new `useEffect` uses a `mountSequenceRef` to record the sequence value observed at mount time. It only triggers the animation when the sequence increases *beyond* that baseline — i.e., for events that happen after the component mounted. Events from before mount are silently ignored regardless of how recently they occurred.

**B) Add `initial={false}` to the fill height `motion.span`.**

This suppresses the fill bar's mount animation. After the first render the bar immediately shows at the correct height; subsequent changes to `fillHeight` still animate normally.

```tsx
// RouteGroupRailAvatar.tsx — changes from current implementation

// 1. Change the type
type RouteGroupRailAvatarProps = {
  item: RouteGroupRailItem;
  onClick: (item: RouteGroupRailItem) => void;
  isDropTarget?: boolean;
  pulseSequence?: number;          // was: incomingPulseToken?: string | null
};

// 2. Change the destructured prop with default
export const RouteGroupRailAvatar = ({
  item,
  onClick,
  isDropTarget = false,
  pulseSequence = 0,               // was: incomingPulseToken = null
}: RouteGroupRailAvatarProps) => {

  // 3. Add the mount-sequence ref (place alongside the other refs)
  const mountSequenceRef = useRef<number>(-1);

  // 4. Replace the incomingPulseToken useEffect entirely
  useEffect(() => {
    // First run: capture the sequence value that existed at mount. Never animate.
    if (mountSequenceRef.current === -1) {
      mountSequenceRef.current = pulseSequence;
      return;
    }

    // Subsequent runs: only animate if the sequence has grown beyond the mount baseline.
    // This means the event happened after this component was mounted — it is a real,
    // fresh post-response signal, not stale state from a previous operation.
    if (pulseSequence <= mountSequenceRef.current) {
      return;
    }

    setIsIncomingPulseActive(true);
    const timer = window.setTimeout(() => {
      setIsIncomingPulseActive(false);
    }, 1150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pulseSequence]);

  // 5. In the JSX: add initial={false} to the fill-height motion.span
  //    Find this element (the one that animates height) and add the prop:
  //
  //    <motion.span
  //      aria-hidden="true"
  //      initial={false}           ← ADD THIS
  //      animate={{ height: fillHeight }}
  //      transition={{ duration: 0.35, ease: "easeOut" }}
  //      style={{ background: `linear-gradient(...)` }}
  //    />
```

The rest of the JSX in `RouteGroupRailAvatar` is unchanged. All references to `isIncomingPulseActive` in the render (the pulse ring, the wobble animation, the `key="incoming-pulse-progress"` label) continue to work identically — they just now only activate when a real post-mount event fires.

---

## How the Fixed Flow Works

### Scenario A — User opens plan while previous batch token would have been active

1. Batch A finished 2 s ago. Store: `sequenceByRouteGroupId[5] = 1`.
2. User opens target plan. Avatars mount.
3. All avatars run their effect for the first time: `mountSequenceRef.current === -1` → capture `mountSequenceRef.current = 1`. Return without animating. ✓
4. New batch B starts. User sees loading cards.
5. Batch B response arrives. `commit` runs. `triggerIncomingRouteGroupPulse(5)` → store: `sequenceByRouteGroupId[5] = 2`.
6. Avatar 5's effect re-runs: `mountSequenceRef.current = 1`, `pulseSequence = 2`. `2 > 1` → animate. ✓
7. Only route group 5 animates. Other route groups are unaffected. ✓

### Scenario B — User opens plan after response already committed

1. Batch finished. Store: `sequenceByRouteGroupId[5] = 3`.
2. User opens target plan. Avatars mount.
3. All avatars capture baseline. Route group 5: `mountSequenceRef.current = 3`. No animation. ✓
4. Next batch response → `triggerIncomingRouteGroupPulse(5)` → `sequenceByRouteGroupId[5] = 4`.
5. `4 > 3` → animate on the next actual event. ✓

### Scenario C — Avatar is mounted before the response arrives (normal case)

1. Batch in flight. Store: `sequenceByRouteGroupId[5] = 0` (never pulsed).
2. User opens plan. Avatars mount. Route group 5 captures `mountSequenceRef.current = 0`.
3. Response arrives. `triggerIncomingRouteGroupPulse(5)` → `sequenceByRouteGroupId[5] = 1`.
4. `1 > 0` → animate. ✓

---

## What Does NOT Change

- `triggerIncomingRouteGroupPulse` public signature — same name, same parameter, called from the exact same place in `orderBatchDeliveryPlan.controller.ts` commit.
- `orderBatchDeliveryPlan.controller.ts` — zero changes.
- `routeGroupIncomingOrderPlaceholder.store.ts` — zero changes.
- The visual animation in `RouteGroupRailAvatar` (pulse ring, wobble, progress label) — unchanged logic, just gated on the corrected `isIncomingPulseActive`.
- `resolveBundleDestinationRouteGroupId` — unchanged.

---

## Files Changed Summary

| File | Change |
|---|---|
| `store/routeGroupIncomingPulse.store.ts` | Full rewrite — sequence counter replaces token presence model |
| `routeGroupRail/DroppableRouteGroupRailAvatar.tsx` | Import new selector, pass `pulseSequence` prop |
| `routeGroupRail/RouteGroupRailAvatar.tsx` | Prop rename + new mount-baseline effect + `initial={false}` on fill bar |
