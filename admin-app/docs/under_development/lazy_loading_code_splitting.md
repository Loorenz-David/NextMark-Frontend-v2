# Lazy Loading & Code Splitting — Admin App

## Goal

Reduce the initial JavaScript bundle delivered to the browser by splitting the application into on-demand chunks. Code for a route or settings section is only downloaded when the user first navigates to it.

## Mechanism

- `React.lazy(() => import('./SomePage'))` — tells Rollup to split the module into its own chunk and tells React to load it on first render.
- `<Suspense fallback={...}>` — wraps a lazy component and renders the fallback while the chunk is fetching.
- Dynamic imports interact with the existing `manualChunks` in `vite.config.ts` cleanly — third-party chunks stay as-is; app chunks are split automatically at each `import()` boundary.

---

## Split Level 1 — Top-Level Routes (`AppRouter.tsx`)

**File:** `admin-app/src/app/router/AppRouter.tsx`

Convert every top-level route element from a static import to a `React.lazy` dynamic import. Wrap the `<Routes>` tree (or each individual route element) in `<Suspense>`.

### Routes to lazy-load

| Route path | Current static import | Target lazy import |
|---|---|---|
| `/auth/*` | `@/features/auth/pages/AuthPage` | `lazy(() => import('@/features/auth/pages/AuthPage'))` |
| `/settings/*` | `@/features/settings/pages/SettingsPage` | `lazy(() => import('@/features/settings/pages/SettingsPage'))` |
| `/external-form/*` | `@/features/externalForm/pages/ExternalCustomerForm.page` | `lazy(() => import('@/features/externalForm/pages/ExternalCustomerForm.page'))` |

The home route (`/`) stays eagerly loaded — it is the landing page after login and must render immediately.

### Suspense placement

Wrap the entire `<Routes>` block in a single `<Suspense>` at the `AppRouter` level. The fallback should be a full-screen neutral skeleton consistent with the dark app shell background (`--color-page`).

```tsx
// AppRouter.tsx — after change
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Home } from '@/features/home-app/pages/HomeAppPage'
import { useAuthSession } from '../../features/auth/login/hooks/useAuthSelectors'
import { AppRouterSkeleton } from './AppRouterSkeleton'   // new file, see Step 5

const AuthPage                = lazy(() => import('@/features/auth/pages/AuthPage'))
const SettingsPage            = lazy(() => import('@/features/settings/pages/SettingsPage'))
const ExternalCustomerFormPage = lazy(() => import('@/features/externalForm/pages/ExternalCustomerForm.page'))

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const session = useAuthSession()
  if (!session) return <Navigate to="/auth/login" replace />
  return children
}

export function AppRouter() {
  return (
    <Suspense fallback={<AppRouterSkeleton />}>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/auth/*" element={<AuthPage />} />
        <Route path="/settings/*" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/external-form/*" element={<ProtectedRoute><ExternalCustomerFormPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
```

---

## Split Level 2 — Home Workspaces (`HomeAppPage.tsx`)

**File:** `admin-app/src/features/home-app/pages/HomeAppPage.tsx`

`route-operations` is the default active workspace — it must be eagerly loaded. The other two workspaces are only shown when the user explicitly switches tabs.

### Workspaces to lazy-load

| Workspace key | Current static import | Target |
|---|---|---|
| `store-pickup` | `@/features/home-store-pickup/pages/HomeStorePickupPage` | `lazy(() => import(...))` |
| `international-shipping` | `@/features/home-international-shipping/pages/HomeInternationalShippingPage` | `lazy(() => import(...))` |

`HomeRouteOperationsPage` (imported via `@/features/home-route-operations`) stays as a static import.

### Suspense placement

Wrap the `<ActiveWorkspaceView>` render output in a `<Suspense>` with a workspace-level skeleton that matches the panel layout (full panel area, dark background, no spinner visible until ≥ 150 ms).

```tsx
// HomeAppPage.tsx — ActiveWorkspaceView after change
import { lazy, Suspense } from 'react'
import { HomeRouteOperationsPage } from '@/features/home-route-operations'
import { WorkspaceSkeleton } from '../components/WorkspaceSkeleton'   // new file, see Step 5

const HomeStorePickupPage          = lazy(() => import('@/features/home-store-pickup/pages/HomeStorePickupPage'))
const HomeInternationalShippingPage = lazy(() => import('@/features/home-international-shipping/pages/HomeInternationalShippingPage'))

function ActiveWorkspaceView({ workspace }) {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      {workspace === 'route-operations'        && <HomeRouteOperationsPage />}
      {workspace === 'store-pickup'            && <HomeStorePickupPage />}
      {workspace === 'international-shipping'  && <HomeInternationalShippingPage />}
    </Suspense>
  )
}
```

---

## Split Level 3 — Settings Sections (`sectionRegistry.tsx` + each `pageRegistry.*`)

This is the highest-granularity split and has the most impact on settings load time. Each settings section becomes its own independent chunk.

**Files changed:**
- `admin-app/src/features/settings/registry/sectionRegistry.tsx`
- All 11 individual `registry/pageRegistry.*` files listed below

### Strategy

Each `pageRegistry` currently does a static import of its page component and exports it directly in the registry object. The change is to replace each static import with `React.lazy`. The type utilities (`ExtractPayload`, `SectionPayloads`) are unchanged.

### Settings section registry — target state

```tsx
// sectionRegistry.tsx — after change
import { lazy } from 'react'

const placeholderSection = () => <div />

export const sectionRegistry = {
  'user.main':              lazy(() => import('@/features/user/pages/UserMainPage').then(m => ({ default: m.UserMainPage }))),
  'team.main':              lazy(() => import('@/features/team/pages/TeamMainPage').then(m => ({ default: m.TeamMainPage }))),
  'team.invitations':       lazy(() => import('@/features/team/pages/TeamInvitationsPage').then(m => ({ default: m.TeamInvitationsPage }))),
  'integrations.main':      lazy(() => import('@/features/integrations/pages/IntegrationsMainPage').then(m => ({ default: m.IntegrationsMainPage }))),
  'integrations.status':    lazy(() => import('@/features/integrations/pages/IntegrationStatusPage').then(m => ({ default: m.IntegrationStatusPage }))),
  'messages.main':          lazy(() => import('@/features/messaging/pages/MessagesMainPage').then(m => ({ default: m.MessagesMainPage }))),
  'smsMessage.main':        lazy(() => import('@/features/messaging/smsMessage/pages/SmsMessageMainPage').then(m => ({ default: m.SmsMessageMainPage }))),
  'emailMessage.main':      lazy(() => import('@/features/messaging/emailMessage/pages/EmailMessageMainPage').then(m => ({ default: m.EmailMessageMainPage }))),
  'printDocument.main':     lazy(() => import('@/features/templates/printDocument/pages/PrintTemplateMainPage').then(m => ({ default: m.PrintTemplateMainPage }))),
  'item.main':              lazy(() => import('@/features/itemConfigurations/pages/ItemMainPage').then(m => ({ default: m.ItemMainPage }))),
  'vehicle.main':           lazy(() => import('@/features/infrastructure/vehicle/pages/VehicleMainPage').then(m => ({ default: m.VehicleMainPage }))),
  'facility.main':          lazy(() => import('@/features/infrastructure/facility/pages/FacilityMainPage').then(m => ({ default: m.FacilityMainPage }))),
  'externalForm.access':    lazy(() => import('@/features/externalForm/pages/ExternalFormAccessPage').then(m => ({ default: m.ExternalFormAccessPage }))),
  'settings.configuration': placeholderSection,
}
```

> **Note on `.then(m => ({ default: m.X }))`:** Required when the page module uses a named export (not `export default`). If any page already uses `export default`, the `.then()` wrapper can be omitted for that entry. Codex must verify each page's export style before writing the final import.

### Individual `pageRegistry.*` files — what changes

Each feature's `pageRegistry` file currently imports and re-exports the page component. Since `sectionRegistry` will import the page directly via `lazy()`, the individual `pageRegistry` files can be simplified to only export their type utilities (keys and payload types) — the component reference no longer needs to live there.

Files to update:

| File | Current export | After change |
|---|---|---|
| `features/user/registry/pageRegistry.tsx` | `UserMainPage` component ref | Remove component import; keep `PageKey` and `UserPagePayloads` types |
| `features/team/registry/pageRegistry.tsx` | `TeamMainPage`, `TeamInvitationsPage` | Remove component imports; keep type exports |
| `features/integrations/registry/pageRegistry.ts` | `IntegrationsMainPage`, `IntegrationStatusPage` | Remove component imports; keep type exports |
| `features/messaging/registry/pageRegistry.ts` | `MessagesMainPage` | Remove component import; keep type exports |
| `features/messaging/smsMessage/registry/pageRegistry.ts` | `SmsMessageMainPage` | Remove component import; keep type exports |
| `features/messaging/emailMessage/registry/pageRegistry.ts` | `EmailMessageMainPage` | Remove component import; keep type exports |
| `features/templates/printDocument/registry/pageRegistry.ts` | `PrintTemplateMainPage` | Remove component import; keep type exports |
| `features/itemConfigurations/registry/pageRegistry.ts` | `ItemMainPage` | Remove component import; keep type exports |
| `features/infrastructure/vehicle/registry/pageRegistry.ts` | `VehicleMainPage` | Remove component import; keep type exports |
| `features/infrastructure/facility/registry/pageRegistry.ts` | `FacilityMainPage` | Remove component import; keep type exports |
| `features/externalForm/registry/pageRegistry.ts` | `ExternalFormAccessPage` | Remove component import; keep type exports |

### Suspense placement for settings sections

`SettingsPage.tsx` reads components from `sectionRegistry` and renders them directly inside `<Route element={...}>`. Wrap each `<Route>` element in `<Suspense>` with a `SettingsSectionSkeleton` fallback, or wrap the entire `<Routes>` block once at the top of `SettingsPage`.

The `SettingsSectionSkeleton` should match the content-panel area dimensions (not the full screen — the nav sidebar and settings shell are already rendered at this point).

---

## Step 4 — `SettingsPage.tsx` route wiring

**File:** `admin-app/src/features/settings/pages/SettingsPage.tsx`

After the registry change, `SettingsPage` no longer needs to destructure components from `sectionRegistry` into local variables. The components are already lazy — just reference them directly.

Wrap the `<Routes>` block in a single `<Suspense fallback={<SettingsSectionSkeleton />}>`.

```tsx
// SettingsPage.tsx — after change (simplified)
import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { sectionRegistry } from '../registry/sectionRegistry'
import { SettingsSectionSkeleton } from '../components/SettingsSectionSkeleton'  // new, see Step 5
// ... other imports unchanged

export const SettingsPage = () => (
  <SettingsProvider>
    <Routes>
      <Route element={<SettingsView />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Suspense fallback={<SettingsSectionSkeleton />}>
          <Route path="profile"              element={<sectionRegistry['user.main'] />} />
          <Route path="team"                 element={<sectionRegistry['team.main'] />} />
          <Route path="team/invitations"     element={<sectionRegistry['team.invitations'] />} />
          <Route path="integrations"         element={<sectionRegistry['integrations.main'] />} />
          <Route path="integrations/status"  element={<sectionRegistry['integrations.status'] />} />
          <Route path="messages"             element={<sectionRegistry['messages.main'] />} />
          <Route path="items"                element={<sectionRegistry['item.main'] />} />
          <Route path="vehicles"             element={<sectionRegistry['vehicle.main'] />} />
          <Route path="facilities"           element={<sectionRegistry['facility.main'] />} />
          <Route path="external-form"        element={<sectionRegistry['externalForm.access'] />} />
          <Route path="print-templates"      element={<sectionRegistry['printDocument.main'] />}>
            <Route path=":channel"        element={<PrintTemplateChannelPage />} />
            <Route path=":channel/:event" element={<PrintTemplateConfigPage />} />
          </Route>
        </Suspense>
      </Route>
    </Routes>
  </SettingsProvider>
)
```

> **Note:** `Suspense` cannot wrap `<Route>` children directly in all React Router v6 versions. If this syntax causes issues, move the `<Suspense>` wrapper inside each route's `element` prop instead. Codex should verify this during implementation.

---

## Step 5 — Skeleton / Fallback Components

Three new skeleton components are needed. These are presentational-only and belong in the app shell or the respective feature's `components/` folder.

### 1. `AppRouterSkeleton`
**Location:** `admin-app/src/app/router/AppRouterSkeleton.tsx`

Full-screen dark background matching `--color-page`. No spinner. A simple filled div is sufficient — the chunk will load in < 300ms on first visit.

```tsx
export function AppRouterSkeleton() {
  return <div style={{ width: '100vw', height: '100vh', background: 'var(--color-page)' }} />
}
```

### 2. `WorkspaceSkeleton`
**Location:** `admin-app/src/features/home-app/components/WorkspaceSkeleton.tsx`

Fills the workspace panel area. Should match the dark panel background without content placeholders. A transparent or `--color-page` fill is appropriate.

```tsx
export function WorkspaceSkeleton() {
  return <div className="flex-1 w-full h-full" style={{ background: 'var(--color-page)' }} />
}
```

### 3. `SettingsSectionSkeleton`
**Location:** `admin-app/src/features/settings/components/SettingsSectionSkeleton.tsx`

Fills only the content-panel area of the settings layout (not the sidebar). A minimal pulse skeleton matching the section content area width and height.

```tsx
export function SettingsSectionSkeleton() {
  return (
    <div className="flex-1 h-full animate-pulse" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '1.1rem' }} />
  )
}
```

---

## Step 6 — Verify `vite.config.ts` chunk output

After implementing the lazy imports, run `npx vite build` and inspect the `dist/assets/` directory. You should see:

- Significantly more `.js` chunk files (one per lazy boundary)
- The main entry chunk (`index-*.js`) substantially smaller
- Settings sections each appearing as their own chunk

No changes to `vite.config.ts` are required — Rollup handles dynamic import splitting automatically. The existing `manualChunks` for third-party libraries continues to work alongside.

---

## Implementation Order

Execute the steps in this order to keep the app functional at each stage:

1. **Step 5 first** — create the three skeleton components. They are needed before the lazy wrappers are wired up.
2. **Step 1** — convert `AppRouter.tsx` to lazy routes. Test: app boots, auth redirect works, settings and external-form routes still render.
3. **Steps 3 + 4 together** — convert `sectionRegistry.tsx` and update `SettingsPage.tsx` in the same pass, since the registry shape changes affect both files.
4. **Each `pageRegistry.*` file** — simplify the 11 individual registries to type-only exports after Step 3 is confirmed working.
5. **Step 2** — lazy-load the two secondary home workspaces. Test by switching workspace tabs.
6. **Step 6** — run production build and verify chunk output.

---

## What Does NOT Change

- `manualChunks` in `vite.config.ts` — no edits needed
- `cssTarget` — no edits needed
- `ProtectedRoute` logic — identical, just moved alongside the lazy import declarations
- All type exports from `sectionRegistry` (`SectionKey`, `SettingsSectionPayloads`) — these are compile-time only and are unaffected by runtime lazy loading
- The `PrintTemplateChannelPage` and `PrintTemplateConfigPage` sub-routes inside settings — these are already nested and can remain static imports within the print-templates section chunk, or be further lazied in a follow-up pass
- All feature internals, stores, API layers, domain code — this plan touches only page-level entry points and the registry/router wiring
