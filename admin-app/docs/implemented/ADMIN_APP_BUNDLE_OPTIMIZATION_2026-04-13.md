# Admin App Bundle Optimization

**Status:** Implemented  
**Date:** 2026-04-13  
**Scope:** `admin-app` lazy-loading rollout and main-chunk reduction

## Summary

This implementation was completed in two connected phases:

1. **Lazy-loading and route/workspace/settings code splitting**
2. **Main-chunk reduction for the home boot path**

The first phase reduced up-front loading by splitting top-level routes, non-default home workspaces, and settings sections into async chunks.

The second phase focused on the remaining oversized `index` entry chunk. It removed non-critical code from the boot import graph while keeping the initial route-operations experience intact:

- map container
- base map
- markers
- routes
- orders
- DnD
- mount animations

The result is a smaller main entry plus dedicated async chunks for:

- settings and auth routes
- non-default workspaces
- settings sub-pages
- AI analytics charts
- map extras
- AI shell/provider
- push-notification runtime
- phone parsing

## Phase 1 — Lazy Loading and Route-Level Splitting

### What changed

The app introduced `React.lazy()` and `Suspense` at the route and feature-shell level.

Implemented boundaries:

- top-level app router
  - `/auth/*`
  - `/settings/*`
  - `/external-form/*`
- home workspaces
  - `store-pickup`
  - `international-shipping`
- settings sections
  - user
  - team
  - integrations
  - messages
  - print templates
  - items
  - vehicles
  - facilities
  - external form access

### UI fallbacks added

Three presentational fallbacks were introduced:

- `AppRouterSkeleton`
- `WorkspaceSkeleton`
- `SettingsSectionSkeleton`

These keep the app shell stable during async module loading without introducing visible spinner-heavy transitions.

### Registry cleanup

The settings section registry was refactored so section components are lazy-loaded directly from `sectionRegistry`, and the old per-feature page registries were reduced to lightweight type exports instead of eagerly importing page components.

### Supporting runtime change

`StackActionManager` was widened so lazy components can be used safely inside stack registries.

## Phase 2 — Main Entry Chunk Reduction

### Goal

After the first phase, the app still had a very large `index` chunk because the boot path was still pulling in non-critical code:

- charting libraries
- phone parsing
- AI shell dependencies
- push-notification runtime
- map clustering and drawing services

This phase reduced that cost without route-splitting the main home workspace.

### 1. AI analytics moved off the boot path

Only the analytics chart renderer was lazy-loaded, not the entire AI feature.

Implemented behavior:

- `AiAnalyticsBarList` now loads through `React.lazy()`
- analytics blocks render behind a fixed-size skeleton
- chart code preloads only after the AI panel opens

This isolates `recharts` and its D3-related dependency graph from initial home boot.

### 2. Map extras split from map core

The critical map optimization was moving non-essential map runtime services out of the `GoogleMapAdapter` constructor.

Map core stays eager:

- map instance manager
- marker layer manager
- marker selection
- marker multi-selection
- route renderer
- viewport manager
- user location
- locate control

Map extras became lazy:

- clustering
- drawing
- shape selection

Implemented behavior:

- `GoogleMapAdapter` now uses internal async loaders instead of eager construction
- clustered marker requests fall back to plain markers first, then upgrade after the cluster module resolves
- drawing and zone-edit operations queue internally until the drawing module is ready
- the public map API surface remains unchanged for callers

An idle preload for map extras was also added after the initial home render.

### 3. Shared map barrel narrowed

The `shared/map` root barrel no longer re-exports heavy runtime classes such as:

- `GoogleMapAdapter`
- `MapController`

It now stays focused on:

- types
- constants
- CSS
- `useMap`
- UI-safe exports

This prevents boot-path imports from accidentally re-anchoring heavy map implementation code in `index`.

### 4. Push runtime and AI shell deferred after first paint

The provider tree was split between:

- **boot-critical**
  - router
  - mobile provider
  - message handler
  - auth bridge
  - live notifications
  - business realtime
  - driver-live realtime
- **deferred**
  - AI shell/provider
  - push-notification runtime

The deferred layer mounts after first paint and loads through lazy imports, so these modules are no longer guaranteed entry-chunk residents.

### 5. Phone parsing chunk isolated

The previous `libphonenumber-js` CommonJS alias was removed and replaced with an ESM entry alias.

Phone parsing remains functionally unchanged, but now resolves into its own vendor chunk instead of being forced into the main boot bundle.

### 6. Vite manual chunk stabilization

After async boundaries were created, Vite chunk naming was tightened so the new split points stay stable.

Additional chunk groups were introduced for:

- `charts`
- `phone`
- `map-extras`
- `ai-panel`

Existing vendor chunking for `react`, `motion`, `dnd`, `realtime`, `jspdf`, `html2canvas`, and `lottie` was preserved.

## Result

### Before the second phase

Observed production output included:

- `index-BRWBpaUO.js` at **1,775.95 kB** minified

### After the second phase

Observed production output included:

- `index-DUcdRl_I.js` at **1,037.02 kB** minified

New dedicated chunks now include:

- `AiAnalyticsBarList-*.js`
- `AdminNotificationsPushProvider-*.js`
- `map-extras-*.js`
- `AdminAiPanelProvider-*.js`
- `ai-panel-*.js`
- `phone-*.js`
- `charts-*.js`

This is a substantial reduction in the main entry while preserving initial route-operations behavior.

## Important Architectural Outcomes

- The home route is still treated as a single boot-critical workspace.
- No aggressive route-based deferral was introduced for route-operations core UI.
- Map callers did not need API changes to benefit from lazy map extras.
- Live notifications remain boot-critical.
- Push-management runtime is no longer required to block first paint.
- AI text/UI shell remains available, while analytics rendering is isolated.

## Main Files Touched

### Phase 1

- `src/app/router/AppRouter.tsx`
- `src/features/home-app/pages/HomeAppPage.tsx`
- `src/features/settings/pages/SettingsPage.tsx`
- `src/features/settings/registry/sectionRegistry.tsx`
- `src/shared/stack-manager/StackActionManager.tsx`

### Phase 2

- `src/app/providers/AppProviders.tsx`
- `src/features/ai/components/renderAdminAiBlock.tsx`
- `src/features/ai/providers/AdminAiPanelProvider.tsx`
- `src/features/home-route-operations/providers/HomeRouteOperationsManagersProvider.tsx`
- `src/shared/map/infrastructure/GoogleMapAdapter.ts`
- `src/shared/map/infrastructure/mapExtrasLoader.ts`
- `src/shared/map/index.ts`
- `vite.config.ts`

## Verification

Implemented verification completed with:

- `npm run build` in `admin-app`

The build passes and the emitted bundle now reflects the intended async boundaries and reduced entry-chunk size.
