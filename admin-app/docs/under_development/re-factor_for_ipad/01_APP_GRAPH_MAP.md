# 01 — App graph map (admin-app)

> Generated 2026-10-24 by a read-only exploration of the codebase. Treat it as a map, not as the truth: re-grep a symbol before editing it. Sections 5–7 (home composition, order→plan→route data flow, printing) are the ones the iPad refactor touches most.

---

# NextMark admin-app: Graph Map (context document)

App root: `/Users/davidloorenz/Desktop/Developer/BeyoApps_2025/NextMark-app-v2/Front_end/admin-app` (shortened to `admin-app/` below; all `src/...` paths are relative to it)
Packages: `/Users/davidloorenz/Desktop/Developer/BeyoApps_2025/NextMark-app-v2/Front_end/packages`
Rules: `/Users/davidloorenz/Desktop/Developer/BeyoApps_2025/NextMark-app-v2/Front_end/AGENTS.md` (799 lines; there is also `Front_end/CLAUDE.md`)

Stack: React 19.1, TS 5.9, Vite 7, Tailwind 4 (`desk:` variant = 1000px), react-router-dom 7, zustand 5, @dnd-kit, framer-motion, socket.io-client, jspdf + html2canvas, supercluster, slate-react, recharts. **There is no vite-plugin-pwa in admin-app.** npm scripts: `dev`, `build` (`tsc -b && vite build`), `lint` (also lints packages), `lint:packages`, `check:popup-contract`, `check:external-form-pwa`, `theme:regression`, `preview`. **There is no `test` script.**

Vite aliases (`vite.config.ts`): `@` -> `src`, `@app` -> `src/shared` (this is confusing: `@app` is NOT `src/app`), `@features` -> `src/features`, `@packages` -> `../packages`, and zustand is pinned to the app's own esm build. `manualChunks` puts the map drawing, extras-loader and cluster code in a `map-extras` chunk and libphonenumber in `phone`. Defines `__APP_BUILD_ID__` and `__APP_BUILD_TIMESTAMP__`.

---

## 0. AGENTS.md layer rules (summary)

1. Classify logic by responsibility first, then place it in its layer. If a change mixes responsibilities, split it.
2. Code in `packages/*` is shared across apps, has no framework, and never imports app code. Consumers import only from the package root barrel (`@shared-domain`, `@shared-api`, `@shared-store`, `@shared-optimistic`, `@shared-message-handler`, `@shared-utils`, `@client-form-kit`). The one allowed deep import is `@client-form-kit/styles/client-form.css`. Exceptions: `@shared-store` (zustand), `@shared-message-handler` and `@client-form-kit` (React UI).
3. Dependency direction: `packages -> app/services -> features/api -> actions -> flows -> controllers -> pages/components`. Lower layers never import higher ones. Components and pages never touch `app/services`.
4. `app/services` owns runtime infrastructure (API clients, session, storage, env). Features never create clients and never read env vars.
5. Feature folders: `domain/ api/ actions/ flows/ controllers/ stores/ providers/ components/ pages/`. Actions do one intent each and are either a query or a mutation. Flows run multi-step orchestration, polling, sockets and optimistic/retry logic. Controllers are UI-facing hooks that expose view models.
6. Stores hold state, mutations and selectors only. No API calls, no workflows, no raw DTOs. Each store has a single clear owner, and stores are granular (no `app.store` / `global.store`).
7. Providers only wire scope. They must not become an alternate flow layer. Pages compose; they contain no orchestration or inline form logic.
8. Each feature has a public barrel (`features/x/index.ts`). Other features must not reach into its internals. Prefer packages or app-level composition for cross-feature needs.
9. Naming: `useXController`, `createX.action.ts`, `loadX.query.ts`, `x.flow.ts`, `XProvider`, `mapXToY`, `canX/isX`, `XViewModel`, `XDraft`. Avoid `helpers`, `utils`, `logic`, `handlers`, `manager`.
10. Async-state vocabulary: idle, loading, ready, empty, retryable_failure, terminal_failure, stale. Expected tests: domain units, actions, flows, controllers, components.

**Reality check:** the codebase only partly follows these rules. Deep cross-feature imports are everywhere (counts in §2). Many features use `hooks/`, `context/` and `store/` instead of `controllers/`, `providers/` and `stores/`. The app API client lives in `src/lib/api/ApiClient.ts`, not in `src/app/services`.

`admin-app/README.md`: Vite SPA talking to the Flask backend (`VITE_API_BASE_URL`). Tokens live in sessionStorage. Optional env vars `VITE_DRIVER_LIVE_DEV_SEED_ENABLED` and `VITE_DRIVER_LIVE_DEV_SEED_POSITIONS`.
`admin-app/IMPLEMENTATION_CONTEXT.md` (dated 2026-03-04) is a snapshot covering the OrderForm SRP refactor (composer providers, slice hooks), the embedded CostumerForm inside the OrderForm customer panel (state machine search/details/form-create/form-edit), customer-selection safeguards, operating hours and delivery windows (`FULL_RANGE`). Other context docs in the app root: `COSTUMER_CONTEXT.md`, `MESSAGING_CONTEXT.md`.

---

## 1. Entry and bootstrap

### `src/main.tsx`
- Sets a `--vh` CSS variable on resize.
- Installs runtime asset diagnostics: logs resource, content, window-error and unhandled-rejection events. In PROD it also logs `[app-build]` and the URL of the controlling service worker. Sets `window.__NEXTMARK_BUILD_INFO__`.
- Renders `<AppProviders><App/></AppProviders>`.
- **No service worker registration here.**

### `src/App.tsx`
`<div class="min-h-dvh bg-[var(--color-page)]"><AppRouter/></div>`

### `index.html`
- Viewport meta includes `viewport-fit=cover`.
- An inline script reads `localStorage['beyo.admin.theme']` and stamps `data-theme` (dark by default).
- **No manifest link, no apple meta tags.** Those are injected per route by the PWA module.

### Router: `src/app/router/AppRouter.tsx` (+ `AppRouterSkeleton.tsx` Suspense fallback)

| Path | Guard | Page component | Feature |
|---|---|---|---|
| `/` | ProtectedRoute | `Home` from `features/home-app/pages/HomeAppPage.tsx` (eager) | home-app |
| `/auth/*` | none | `AuthPage` (lazy) `features/auth/pages/AuthPage.tsx`, which switches login/register on pathname | auth |
| `/settings/*` | ProtectedRoute | `SettingsPage` (lazy) `features/settings/pages/SettingsPage.tsx` | settings |
| `/external-form/*` | ProtectedRoute | `ExternalCustomerFormPage` (lazy) `features/externalForm/pages/ExternalCustomerForm.page.tsx` | externalForm |
| `*` | none | `Navigate` to `/` | — |

`ProtectedRoute` uses `useAuthSession()` (`features/auth/login/hooks/useAuthSelectors`) and redirects to `/auth/login` when there is no session.

Settings sub-routes (`SettingsPage` renders nested `<Routes>` inside `SettingsView`; components come from `features/settings/registry/sectionRegistry.tsx` via lazy imports):

| Sub-route | Page |
|---|---|
| index | `SettingsIndexRoute` |
| `profile` | user/pages/UserMainPage |
| `team` | team/pages/TeamMainPage |
| `team/invitations` | team/pages/TeamInvitationsPage |
| `integrations` | integrations/pages/IntegrationsMainPage |
| `integrations/status` | integrations/pages/IntegrationStatusPage |
| `messages` | messaging/pages/MessagesMainPage |
| `items` | itemConfigurations/pages/ItemMainPage |
| `vehicles` | infrastructure/vehicle/pages/VehicleMainPage |
| `facilities` | infrastructure/facility/pages/FacilityMainPage |
| `trusted-devices` | auth/trusted-device/pages/TrustedDeviceMainPage |
| `external-form` | externalForm/pages/ExternalFormAccess.page |
| `external-form/configuration` | clientFormConfig/pages/ClientFormConfigMainPage |
| `print-templates` | templates/printDocument/pages/PrintTemplateMainPage; nested `:channel` -> PrintTemplateChannelPage, `:channel/:event` -> PrintTemplateConfigPage |

### Provider tree: `src/app/providers/AppProviders.tsx` (outermost to innermost)

```
ThemeProvider                       (app/theme; syncs data-theme from zustand theme.store)
 BrowserRouter
  ViewportProvider                  (app/viewport; isMobile <=999px, isCoarsePointer, hasHover)
   MessageHandlerProvider           (@shared-message-handler; 8000ms, max 2)
    AdminNotificationsProvider      (realtime/notifications; notifications channel listen)
     AdminBusinessRealtimeProvider  (realtime/business; team_admin business events -> stores)
      DriverLiveRealtimeProvider    (realtime/driverLive; team_driver_live)
       OrderLinkedDeviceFormProvider(features/order barrel; employeeUserId from session)
        StepSequenceProvider        (shared/overlays/stepSequence)
          <ApiAuthBridge/>          (sets apiClient unauthenticated handler -> trusted-device eviction or /auth/login;
                                     consumes the auth notice; on token: fetchBootstrap() + ensureRealtimeConnected())
          <ExternalFormPwaProvider/>(app/pwa; renders null)
          {children = <App/>}
          <DeferredAppEnhancers/>   (requestIdleCallback -> lazy AdminNotificationsPushProvider; AI panel commented out)
```

`src/app/providers/MobileProvider.tsx` is a compatibility shim that re-exports ViewportProvider. `src/app/contexts/MobileContext.tsx` is a 3-line legacy file.

### `src/app/services/`
- `sessionLocation.service.ts`: `getCountryCode`, `getCity`, `getZoneCityKey` delegating to `apiClient`.
- `driverLiveDevSeed.service.ts`: reads the `VITE_DRIVER_LIVE_DEV_SEED_*` env vars and returns fake driver positions.
- The real HTTP client is **`src/lib/api/ApiClient.ts`** (singleton `apiClient`: session, refresh tokens, unauthenticated handler, session country/city), plus `compression.ts` (pako) and `types.ts`.

### `src/app/theme/`
- `theme.store.ts`: zustand; theme is dark or light, persisted to localStorage `beyo.admin.theme`.
- `ThemeProvider.tsx` sets `documentElement[data-theme]`.
- `ThemeToggle.tsx` is the UI toggle, used in HomeDesktopHeader.
- `theme.types.ts` holds `THEME_STORAGE_KEY` and `DEFAULT_THEME`.

### `src/app/viewport/`
- `viewport.config.ts`: `MOBILE_MAX_WIDTH=999`, plus the mobile, desktop, coarse-pointer and hover media queries.
- `ViewportContext.ts`, `ViewportProvider.tsx` (matchMedia listeners), `useViewport.ts`. The barrel exposes `useMobile` / `useViewport`.
- Rule: nothing else may measure the window to decide "is this a phone".

### `src/app/pwa/`: the existing external-form PWA

**Purpose.** An iPad in the store installs **only the `/external-form` route** (the in-store customer form) to the Home Screen via Safari's Share sheet, and it runs without browser chrome. This is presentation metadata only: no offline support and no caching.

**Files**

| File | Role |
|---|---|
| `index.ts` | Barrel: `ExternalFormPwaProvider`, `EXTERNAL_FORM_MANIFEST_CONTRACT`, `EXTERNAL_FORM_MANIFEST_PATH`, `EXTERNAL_FORM_PATH`, `isExternalFormPath`, `isStandaloneDisplay` |
| `ExternalFormPwaProvider.tsx` | Renders null. Calls `useExternalFormPwaHead()` and `useStandaloneContainment()`. It is the single owner, mounted inside the router in AppProviders. |
| `domain/externalFormPwa.ts` | `EXTERNAL_FORM_PATH='/external-form'`; `MANIFEST_PATH='/external-form.webmanifest'`; `ICON_BASE='/pwa/external-form'`; `EXTERNAL_FORM_MANIFEST_CONTRACT` (start_url and scope `/external-form`, display standalone, name "NextMark Customer Form", short_name "Customer Form", bg/theme `#efe7d7`); `EXTERNAL_FORM_PWA_HEAD_TAGS` (manifest link, apple-touch-icon 180, apple-mobile-web-app-capable, mobile-web-app-capable, status-bar-style `default`, apple title, theme-color); `isExternalFormPath` (exact path or `/external-form/` children only); `resolvePwaHeadState(pathname)`, which returns the tags and title "Customer Form" on the form route and `{tags:[], title:null}` everywhere else. |
| `domain/managedHead.ts` | `createManagedHead(port)` reconciles the `<head>` tags a route owns. Every tag it writes is marked `data-pwa-managed`, so removal is exact and never touches tags the build shipped. It captures the original document.title before the first apply and restores it on `clear()`. |
| `infrastructure/documentHead.port.ts` | The DOM implementation of `ManagedHeadPort`. |
| `useExternalFormPwaHead.ts` | One effect: `head.apply(resolvePwaHeadState(pathname))` on each pathname change, `head.clear()` on unmount. |
| `domain/standaloneDisplay.ts` | `isStandaloneDisplay(env)` is true when `navigator.standalone === true` (iOS) or matchMedia matches display-mode `standalone`, `fullscreen` or `window-controls-overlay`. `minimal-ui` is deliberately excluded. `readStandaloneDisplayEnvironment()` reads the globals. |
| `domain/standaloneContainment.ts` | `isContainmentArmed({standalone, launchPathname})` = standalone AND the launch path is the external form. `resolveContainmentRedirect({armed, pathname})` returns null when disarmed, inside the form family, or on `/auth*`; otherwise it returns `/external-form`. |
| `useStandaloneContainment.ts` | Decides "armed" **once**, at first render (from the launch path). After that, any navigation outside the form or auth calls `navigate('/external-form', {replace:true})`. The comment says it is inert in a tab and in an installed app that did not launch into the form, and the type docs say explicitly: "an installed admin surface, if one ever exists, must not be dragged onto the form route by this rule". |
| `domain/tests/externalFormPwa.test.ts` | Framework-less `runExternalFormPwaTests()` with assertions on the contract, head reconcile and containment. |

**Static assets**
- `public/external-form.webmanifest`: `id` `/external-form`, start_url and scope `/external-form`, standalone, icons `/pwa/external-form/icon-192.png`, `icon-512.png`, `apple-touch-icon-180.png`.
- `public/admin-notifications-sw.js` (108 lines) is a **web-push-only service worker**:
  - `push` handler: shows a notification and encodes a launch payload `{notification_id, occurred_at, target}`.
  - `notificationclick` handler: focuses an existing client (or opens a window) at the registration scope with an `?adminNotification=` query param, and posts an `admin-notification-click` message.
  - It has no fetch handler and no caches.
- The SW is registered by `src/realtime/notifications/adminWebPush.runtime.ts` (`navigator.serviceWorker.register('/admin-notifications-sw.js')`, so the default scope is `/`). Registration is triggered unconditionally (when supported) from `AdminNotificationsPushProvider` on deferred mount (`useEffect` that calls `registerAdminNotificationsServiceWorker()`). The VAPID key comes from `VITE_WEB_PUSH_PUBLIC_KEY`.

**Guard script `scripts/check-external-form-pwa.mjs` (`npm run check:external-form-pwa`) enforces:**
1. `public/external-form.webmanifest` exists and agrees with `EXTERNAL_FORM_MANIFEST_CONTRACT`. The script parses the TS source with a regex on the block `EXTERNAL_FORM_MANIFEST_CONTRACT = {...\n} as const` and reads keys of the form `key: 'string'` or `key: EXTERNAL_FORM_PATH`. Do not reshape that block.
2. The manifest has `display === 'standalone'`, `start_url === '/external-form'`, a scope that is set and **not `/`** (the scope must be the form route family, not the whole admin app), and a start_url inside the scope.
3. Both a 192x192 and a 512x512 icon are present, and every icon `src` exists under `public/`. The apple-touch-icon path, resolved from the `ICON_BASE` and `EXTERNAL_FORM_APPLE_TOUCH_ICON` source literals via regex, must exist.
4. `public/admin-notifications-sw.js` exists, has **no `addEventListener('fetch'`**, **no use of `caches`**, and keeps both the `push` and `notificationclick` handlers.
5. None of `public/sw.js`, `public/service-worker.js` or `public/pwa-sw.js` exists, because a second root-scope SW would compete with the notification SW.

**Implications for an app-wide admin PWA**
- The admin PWA must not change the external-form manifest's scope or start_url, and must not add the forbidden SW filenames.
- Any offline caching (a workbox `fetch` handler) placed inside `admin-notifications-sw.js` breaks the guard.
- A workbox SW like the driver-app's would be generated into `dist/` (named `sw.js` by default). The guard only inspects `public/`, but that SW would still fight `/admin-notifications-sw.js` for root scope.
- A static admin `<link rel="manifest">` added to `index.html` would coexist with the managed external-form manifest tag on `/external-form`. Today `resolvePwaHeadState` returns no tags off the form route, so an admin manifest is best managed through the same `managedHead` mechanism: swap the tags per route.
- `useStandaloneContainment` is armed only when the app was launched standalone into `/external-form`. An admin PWA launched at `/` stays unaffected.
- The comment in `index.html` ("the external form is the only one that reads safe-area") is stale. `.safe-top`, `.safe-bottom` and `.safe-x` helpers (`src/index.css`, around lines 1243-1253) are used by HomeMobileShell, HomeMobileView, the OrderForm/CostumerForm shells, SettingsMobileView and RouteGroupEditFormShell.

---

## 2. Feature catalogue (`src/features/*`)

Dependency counts were measured from `@/features/...` imports only; "deep" means the import bypasses the barrel.

| Feature | Files | Purpose and main pieces | Barrel | Depends on |
|---|---|---|---|---|
| **ai** | 24 | Admin AI command panel: `providers/AdminAiPanelProvider`, `AiCommandBar`, analytics blocks (KPI, bar list, tables, narrative), `hooks/useAiCommand`, `api/ai.api`, `domain/adminAiPanelAdapter`. **Currently unmounted** (commented out in AppProviders `DeferredAppEnhancers`). Uses `packages/ai-panel`. | `index.ts` (AdminAiPanelProvider) | order (deep 5) |
| **auth** | 56 | Three sub-features: `login/` (LoginForm, `useLoginMutations`, `authLoginApi`, stores `authSessionStore`, `sessionStorage` (session accessor used by realtime), `authStateStorage`, `authNotice`), `register/`, and `trusted-device/` (multi-user trusted devices: `ActingUserButton`, `SwitchActingUserPopup`, enroll/reprovision/secret popups, `trustedDeviceStore`, `deviceCredentialStorage`, page `TrustedDeviceMainPage`). `pages/AuthPage.tsx`. Doc: `Front_end/docs/TRUSTED_DEVICE_MULTI_USER_SESSIONS.md`. | Only `trusted-device/index.ts` (exports `actingUserPopupRegistry`, ActingUserButton...) | team (deep 4) |
| **bootstrap** | 2 | `bootstrap.hook.ts` `useBootstrap().fetchBootstrap()` calls `GET /bootstrap/` (`bootstrp.api.ts`, typo in the filename) and fans out into many feature stores: item_states, order_states, team_members, label_templates (print templates), email/sms message templates, plan_states, vehicles, zones_context, client_form_settings, client_form_rules, client_form_media. Non-compliant: no folders, deep imports into 8+ features. | none | team, order, itemConfigurations, infrastructure (+ relative imports into templates, messaging, plan, zone, clientFormConfig) |
| **clientFormConfig** | 93 | Settings for the customer delivery-details form: settings, rules, media, terms (slate TermsEditor), redirects. Fully layered: `api/ actions/ flows/ controllers/ store/ pages/ popups/`. Pages: ClientFormConfigMainPage, Rules, Media, Terms, Redirect. | none | none |
| **costumer** (sic, "customer") | 68 | Customers: `api/costumerApi`, controllers `costumerQueries` / `costumerMutations` / `useCostumerFormSubmit`, flows (search, query, order hydration, operating hours, form bootstrap), stores `costumer.store`, `costumerList.store`, `costumerDetailUI.store`, page `costumerDetail.page`, popup `CostumerForm`, embeddable `CostumerFormEmbedded`, `CostumerSearchBar`. Registries `costumer.form` (popup) and `costumer.details` (section). | `index.ts` (big) | order (barrel 5 / deep 7), home-route-operations (deep 1) |
| **externalForm** | 10 | The in-store linked-device customer form page (`ExternalCustomerForm.page.tsx`, built on `@client-form-kit` `ClientFormProvider`, `ClientFormSteps`, `ClientFormFrame`), idle/preparing/unavailable/submitted screens, realtime via `realtime/externalForm`, `ports/linkedDeviceClientForm.ports.ts`, `api/linkedDeviceConfig.api`, `flows/externalFormLiveProgress.flow`. `ExternalFormAccess.page` lives in settings. | none | none (uses `@/realtime`) |
| **home** | 1 | `views/HomeDesktopView.tsx` is an **empty, dead file**. | none | — |
| **home-app** | 19 | Home shell: `pages/HomeAppPage.tsx` (`Home`), `providers/HomeAppProvider` (activeWorkspace context), `providers/HomeAppManagersProvider` (global popup and section managers), `HomeDesktopHeader`, mobile `HomeMobileShell`, `HomeMobileTabBar`, `HomeMobileAlertsPage`, `HomeMobileSettingsPage` (workspace switcher), `stores/homeMobileShell.store`, flows `homeMobileBack` (history pushState/popstate layers), `homeMobileLayers`, `useHomeMobileCloseLayer`. | `index.ts` (useHomeApp, useHomeMobileShellStore, HOME_MOBILE_TABS, types) | home-route-operations (deep 4, barrel 1), auth (deep 3), order (deep 1) |
| **home-international-shipping** | 1 | `pages/HomeInternationalShippingPage.tsx`: "coming soon" placeholder. | none | — |
| **home-store-pickup** | 1 | `pages/HomeStorePickupPage.tsx`: "coming soon" placeholder. | none | — |
| **home-route-operations** | 45 | The main dispatch workspace: page, desktop and mobile views, layout (`HomeDesktopLayout`, `MapArea`, `PlanArea`, `OverlayRail`), `HomeRouteOperationsManagersProvider` (DnD + map), registries (homePopups, homeSections, homeMobileTabs, planWorkspaceRegistry), dnd collision strategies, `store/homeDesktopLayout.store` (+ `.storage`), flows (derived state, rail settle, map selection guard, active plan workspace), dev fixture mode. | `index.ts` (HomeRouteOperationsPage, HomeOverlays, homePopupRegistry, homeSectionRegistry, homeCollisionDetection, RouteOperationsDragOverlay) | plan (deep 19, barrel 4), order (deep 12), zone (deep 3), costumer (deep 2), home-app, store-pickup-orders, international-shipping-orders, orderCase, auth |
| **infrastructure** | 81 | Sub-features `vehicle/` and `facility/`, each with api, hooks (controllers / selectors / store queries / popups / hydrate), `vehicleStore`, `vehicleListStore`, `facilityStore`, pages VehicleMainPage and FacilityMainPage. | none | none |
| **integrations** | 45 | Shopify, Twilio and email integrations: `api/integration*Api`, IntegrationsCarousel, `integrationStore`, pages IntegrationsMainPage and IntegrationStatusPage, registries. Uses hooks/ instead of controllers/. | none | none |
| **international-shipping-orders** | 10 | Plan-workspace page for **container plans of objective `international_shipping`**: `InternationalShippingOrders.page`, `internationalShippingOrders.store`, `internationalShippingPageInitialization.flow`. Proper layering. | `index.ts` | plan (deep 4, barrel 3), order |
| **itemConfigurations** | 96 | Item types, properties, states and positions: stores `itemTypeStore`, `itemPropertyStore`, `itemStateStore`, `itemPositionStore`; pages ItemMainPage, ItemTypesPage, ItemPropertiesPage, ItemStatesPage, ItemPositionsPage; `ensureItemTypesLoaded.flow`. | `index.ts` (ensureItemTypesLoaded, ItemType) | none |
| **messaging** | 84 | Email and SMS message templates (`emailMessage/`, `smsMessage/`, each with api, store, hooks, pages, popups, registry), MessagesMainPage, template editors. | none | plan (barrel 16, deep 2), templates (deep 5), order, integrations |
| **order** | 361 | Core orders feature, largest after plan. Pages: `order.page` (section wrapper), `orderMain.page` (list + header, `OrderProvider`), `orderDetail.page`. Popups: OrderForm (large, `forms/orderForm/` SRP structure), EditOrderNote, FailureNote, OrderFilter, SendClientFormLink. `item/` sub-feature (ItemCard, ItemForm popup, `item.store`, label download flows). Controllers: order, orderMutations, orderBatchDeliveryPlan, orderBatchSelection, orderState(+Batch), orderImport (CSV), orderPlanPatch, useOrderDetailPage, linked-device widget. Flows: order, orderMapMarkers, orderMapData, orderCircleSelection, orderRouteContext, orderDriverLiveMap, linked-device client-form handoff/background. Providers: `OrderLinkedDeviceFormProvider`. `realtime/useOrderEventHistoryRealtime`. 18 stores (see §6). Registries: `orderPopups.registry` (`order.create`, `order.edit`, `order.item.create`, `order.item.edit`, `order.note.edit`, `order.filter.panel`, ...) and `orderSection.registry` (`order.main`, `order.details`, legacy cases). | `index.ts` (useOrderController, useOrderMutations, useOrderFlow, DraggableOrderCard, OrderDragOverlayCard, upsertOrders, ItemCard, OrderLinkedDeviceFormProvider...) | plan (deep 70!), costumer (barrel 22, deep 7), templates (deep 8), itemConfigurations, externalForm (deep 5), home-route-operations (deep 3), messaging, auth |
| **orderCase** | 45 | Order cases (support tickets) and case chat: pages CaseMainPage, CaseOrderPage, CaseDetailsPage (section registry `orderCase.main`, `orderCase.orderCases`, `orderCase.details`), stores `orderCaseStore`, `orderCaseList.store`, `orderCaseQueryStore`, flow `orderCase.flow`, `realtime/useOrderCaseChatRealtime` (order_chat channel). | none | order (barrel 2) |
| **plan** | 334 | Route plans (delivery plans): plan list `pages/Plan.page.tsx` (`RoutePlanPage`), `views/PlanDesktopShell` (list, calendar or timeline per `planCalendar.store` view), `calendar/` (PlanCalendarPage, day cells, day-plans overlay, drag targets), `PlanForm` popup, `dnd/` (intent resolution), `hooks/usePlanOrderDndController.tsx` (1071 lines, the DnD brain), `controllers/useExecutePlanDndIntent.ts`, `bridges/` (order create/update/delete into plan artifacts), **`routeGroup/`** (192 files: route groups, route solutions, route stops, optimization, warnings, rail, map overlays, `RouteGroups.page`, `RouteGroupWorkspaceRuntime`, create/edit popups). Stores in §6. | `index.ts` (usePlanOrders, planPopupRegistry, handlePlanOrderCreation, useIsRouteMapRefreshing, usePlanContainerView, PlanPickerSheet, useAssignSelectedOrdersAction...); also `routeGroup/index.ts` | order (deep 97!, barrel 15), home-route-operations (deep 8), templates (deep 5), zone (deep 4, barrel 3), infrastructure (deep 4), team, auth |
| **role** | 22 | `userRole/` and `roleRules/` (date-range access rules, order-state transition rules): api, hooks, stores, types. No pages. | none | none |
| **settings** | 11 | Settings shell: `pages/SettingsPage` (nested routes), `registry/sectionRegistry.tsx` (lazy pages), `views/SettingsMobileView`, `context/SettingsProvider`, `domain/settingsSections`. | none | auth (deep 5), itemConfigurations, clientFormConfig, templates, infrastructure, user, team, integrations (all deep) |
| **store-pickup-orders** | 10 | Plan-workspace page for **container plans of objective `store_pickup`**: `StorePickupOrders.page`, `storePickupOrders.store`, `storePickupPageInitialization.flow`. | `index.ts` | plan (deep 4, barrel 3), order |
| **team** | 68 | `members/` and `invitations/`: stores `teamMemberStore` (bootstrap insert), `teamMemberListStore`, invite sent/received stores, pages TeamMainPage and TeamInvitationsPage. | none | role (deep 4), auth (deep 3) |
| **templates** | 49 | `printDocument/`: print template configuration plus PDF rendering. Everything printing-related lives here (§7). Has `api/ controllers/ domain/ flows/ pages/ store/ registry/ setters/ types/`. `utils/` (de)serializeTemplate. | `printDocument/index.ts` (no root barrel) | none |
| **user** | 25 | Current user profile: `user.store`, `useUserController`, `useUserFlow`, `useUserActions`, `UserMainPage`. | none | none |
| **zone** | 57 | Delivery zones (polygons) on the map: `ZoneMapOverlay`, `ZoneMapLayer`, `ZonePolygonLayer`, `ZoneSelector`, `ZoneTemplateForm`, popup `zone.form`; stores `zone.store`, `zoneVersion.store`, `zoneVisibility.store`; actions (search, create, update, delete, loadGeometry, loadTemplate); `insertZonesFromBootstrap.flow`; `ZoneManagement.page` is exported but no consumer was found. Well layered. | `index.ts` (large; api, actions, controllers, components) | infrastructure (deep 2) |

**Folder compliance overview**
- Close to the contract: clientFormConfig, zone, store-pickup-orders, international-shipping-orders, plan/routeGroup.
- Use `hooks/`, `context/` or `store/` instead of controllers/providers/stores: auth, costumer, integrations, team, user, role, itemConfigurations, infrastructure, messaging.
- Non-compliant: bootstrap (flat), home (dead file).
- Cross-feature coupling between plan and order is heavy and bidirectional through deep imports.

---

## 3. Shared infrastructure (`src/shared/*`)

| Folder | Provides |
|---|---|
| `stack-manager/` | `StackActionManager<TPayloadMap>` (class, 368 lines, `StackActionManager.tsx`): a registry-keyed stack of entries `{id(uuid), key, payload, parentParams, isClosing}`. API: `open({key,payload,parentParams})`, `close(id?)`, `closeExact`, `closeExactWithDelay`, `closeByKey`, `closeAll`, `subscribe`, `getSnapshot`, `hasKey`, `getOpenCount`, `getEntry`, `renderStack({variant,width})` (variant `'dynamicSectionPanels'` renders section panels with framer-motion; the default renders popups). `types.ts`: `StackComponentProps<P> = {payload?, onClose?}`. `useStackActionEntries(manager)` is a subscribe hook that triggers re-renders. **"popupManager", "sectionManager" and "baseControlls" are not files.** They are instances or objects registered in the ResourceManager context (see below). |
| `resource-manager/` | `ResourcesManagerProvider({managers})` **merges with parent context**, so nested providers add managers. `KnownResourceRegistry`: popupManager, sectionManager, mapManager (MapBridge), settingsPopupManager, popupConfirmationManager, baseControlls (`BaseControls{isBaseOpen,payload,openBase,closeBase,setBasePayload}`, the "base panel" = the open plan workspace), planDropFeedback, unscheduleDropFeedback, routeReorderPreview, routeOperationsActiveDrag. Hooks (`useResourceManager.ts`): `useResourceManager`, `usePopupManager`, `useSectionManager`, `useOptionalSectionManager`, `useBaseControlls`, `useOptionalBaseControlls`, `useMapManager`. |
| `popups/` | `MainPopup/` is the older system (MainPopupProvider, PopupHeader/Body/Footer, DeclarePopupHeader, variant map, ClassicLayout, useCloseGuard); 28 feature files import it. `featurePopup/` is the newer shell: `FeaturePopupShell` (sizes sm, md, mdNoHeight, lg, full; DarkOverlay; mobile-aware), Header/Body/Footer, `FeaturePopupClosePrompt`, `useFeaturePopupCloseController`; 17 feature files. Also `ConfirmActionPopup`, `FloatingPopover` (@floating-ui), `loadingPopup`. |
| `section-panel/` | `SectionPanel`, `SectionHeader`, `SectionPanelContext`: the panel chrome for stacked sections (order list, plan workspace, mobile tab roots). |
| `overlays/` | `bottomSheet/` (BottomSheet, ActionSheet, registry, `useBackLayerRegistration`, which integrates with the mobile back stack), `pushedPage/` (PushedPage), `stepSequence/` (StepSequenceProvider mounted app-wide, StepSequenceOverlay, StepIndicator, `useStepSequence`, `useStepSequenceRunner`, pacing domain + test). |
| `map/` | Google Maps abstraction. `hooks/useMap.ts` returns `MapBridge` and wraps `domain/services/MapController` around `infrastructure/GoogleMapAdapter`. Infrastructure: `core/` (MapInstanceManager, ViewportManager), `markers/` (MarkerLayerManager, ClusterLayerManager (supercluster), MarkerSelectionManager, MarkerMultiSelectionManager), `drawing/` (DrawingManagerService, ShapeSelectionService (circle selection), ZoneGeometryExtractor), `route/RouteRenderer` (polylines and progress), `location/UserLocationManager`, `controls/LocateControlManager`, `mapExtrasLoader` (lazy `map-extras` chunk). `presentation/` holds DOM element factories (markers, clusters, locate/driver/zone toggle buttons). `domain/` holds entities (MapOrder, Route, ClusterRecord), `markerLayers` and `drawingSelectionModes` constants. Components: MapView, MapMultiSelectOverlay, MapDrawingSideControls, MarkerAnchorPopover, DriverLocationMarkerPopover. 4 tests. Barrel `index.ts`: useMap, MapView, MAP_MARKER_LAYERS, preloadMapExtras, types. Uses `packages/shared-google-maps` for loading and places. |
| `hooks/` | Only `useScrollHideActionBar.ts`. Also `src/lib/utils/useMediaQuery.ts`. |
| `layout/` | AccordionSection, CounterBadge, CustomInstructions, DarkOverlay, InfoHover, LabelValue, MemberAvatar, StateCard, WarningCount, cells, simplePill, slideCarousel. |
| `inputs/` (85 files) | InputField, FieldContainer, CustomCounter, CustomDatePicker, CustomDateTimePicker, CustomTimePicker, LabelPicker, ObjectLinkSelector, OperatingHoursEditor, OptionPopoverSelect, PhoneField (libphonenumber), SegmentedSelect, SelectInputWithPopover, Switch, TagInput, TemplateEditor, address-autocomplete, CollapsibleSection, InputWarning + hook. |
| `buttons/` | BasicButton, DeleteButton, DropdownButton, PageBackButton, SearchBar, ThreeDotMenu, constants. |
| `searchBars/` | `SearchFilterBar` + `ActiveFilterPills`. |
| `calendar/` (29) | Generic calendar domain, model and UI with 11 tests. |
| `loadingCards/` | LoadingCardBase, `order/OrderLoadingList`. |
| `spiners/` | AnimationRenderer, circular, loading-bar, lottie spinners. |
| `data-validation/` | Address, phone and time validation. |
| `media/` | RemoteImage, imageSource. |
| `relations/` | ItemRelationSelector. |
| `utils/` | browserGeolocation, resolveUserCurrentLocation, formatIsoDate, teamTimeZone. |

Packages present (`packages/`): ai-panel, client-form-kit, shared-api (`orders/createOrdersApi.ts`, items, http, core), shared-domain, shared-failure-notes, shared-google-maps, shared-icons, shared-inputs, shared-message-handler, shared-optimistic (`optimisticTransaction`), shared-realtime, shared-store (`createEntityStore`, `createListStore`), shared-utils.

---

## 4. Realtime (`src/realtime/*`)

- **Client:** `src/realtime/client.ts` creates `adminRealtimeClient = createRealtimeClient({baseUrl: VITE_API_BASE_URL, sessionAccessor: auth sessionStorage, onAuthError: refresh then connect})` from `@shared-realtime`. `ensureRealtimeConnected()` mints a socket token through a refresh when the active trusted-device user has none. It is called from `ApiAuthBridge`.
- **Transport** (`packages/shared-realtime/src/transport/socketIoTransport.ts`): one socket.io connection at path `/socket.io` (a single default namespace, no namespaces). Logical "channels" are server rooms joined through the `realtime:subscribe` / `realtime:unsubscribe` emits. The client in `core/client.ts` replays subscriptions and `registerRejoin` room joins on reconnect.
- **Event contract** (`packages/shared-realtime/src/contracts/events.ts`):
  - Server events: `realtime:event` (business envelope), `realtime:error`, `driver_location.updated` / `.snapshot`, `notification:event` / `:snapshot`, `external_form:received` / `:requested` / `:progress`, `client_form:submitted`.
  - Client events: subscribe, unsubscribe, `driver_location:publish`, `notification:mark_read`, `external_form:join_user` / `leave_user` / `submit_user` / `request_user` / `progress_user`.
  - Channels: `team_admin`, `team_members`, `team_orders`, `team_order_cases`, `route_orders`, `team_driver_live`, `order_chat`.
- Channel factories: `packages/shared-realtime/src/channels/{business,clientForm,driverLive,externalForm,notifications}.ts`.
- `src/realtime/core/socket.manager.ts` is legacy and unused.

| Owner (subscriber) | Channel / events | Writes to |
|---|---|---|
| `realtime/business/AdminBusinessRealtimeProvider.tsx` (499 lines; in AppProviders) | `adminBusinessChannel.subscribeTeamAdmin`, deduped by event_id (`adminBusinessRealtimeCoordinator.ts`: recent-id map plus in-flight refresh dedupe per order, case, plan and route group). Handles `order.created/updated/state_changed`, `order_case.created/updated/state_changed`, `order_chat.message_created`, `delivery_plan.updated`, `route_solution.created/updated`, `route_solution_stop.updated`. Also subscribes to `client_form:submitted` (`realtime/clientForm/clientForm.realtime.ts`) and mounts `useOrderEventHistoryRealtime`. | useOrderStore, useOrderStateStore, useRoutePlanStore, orderCase stores, routeGroup/routeSolution refreshes (via order/plan/orderCase api + flows; deep imports) |
| `realtime/driverLive/DriverLiveRealtimeProvider.tsx` | `subscribeTeamDriverLive` | `driverLive.store`, `driverLiveVisibility.store`, `driverLiveMarkerOverlay.store`; `driverLive.map.ts` handles map projection (tested) |
| `realtime/notifications/AdminNotificationsProvider.tsx` | `notificationsChannel.listen` | `notification.store` (shared `createNotificationStore`) |
| `realtime/notifications/AdminNotificationsPushProvider.tsx` (deferred) | Web push: registers the SW, syncs the subscription (`adminWebPush.api/.controller/.store/.runtime`) and consumes the `?adminNotification=` launch param | `adminWebPush.store` |
| Bridges in home: `AdminNotificationClickBridge`, `AdminNotificationsActiveViewBridge` (in HomeAppManagersProvider), `AdminNotificationWorkspaceBridge` (in HomeRouteOperationsPage) | Open order detail or case detail, and switch the workspace to route-operations | — |
| UI: `AdminNotificationsTrigger`, `AdminNotificationItem`, `AdminNotificationsAlertToggle`, `playAdminNotificationChime` | — | — |
| `realtime/externalForm/externalForm.realtime.ts` + `useExternalFormRealtime.ts` | External-form room (team-scoped `registerRejoin`), requested, received and progress events | Used by `features/externalForm` and the order linked-device flows (`orderFormExternalRealtime.flow`, `requestOrderClientFormOnLinkedDevice.flow`, `orderLinkedDeviceFormBackground.flow`) |
| `features/orderCase/realtime/useOrderCaseChatRealtime.ts` | `createOrderChatChannel` | orderCase chat |

---

## 5. Home screen composition

```
AppRouter "/" -> Home   (features/home-app/pages/HomeAppPage.tsx)
 HomeAppProvider                         activeWorkspace: 'route-operations' | 'store-pickup' | 'international-shipping' (React state, default route-operations)
  HomeAppManagersProvider                (home-app/providers/HomeAppManagersProvider.tsx)
     ResourcesManagerProvider{ popupManager = StackActionManager(homePopupRegistry),
                               sectionManager = StackActionManager(homeSectionRegistry),
                               baseControlls = useBaseControlls() (home-route-operations/hooks/useBaseControlls.ts) }
     AdminNotificationsActiveViewBridge, AdminNotificationClickBridge
   HomeAppShell
    mobile:  HomeMobileShell(ActiveWorkspaceView) + HomeOverlays + OrderLinkedDeviceLiveWidget
    desktop: HomeDesktopHeader (ThemeToggle, ActingUserButton, AdminNotificationsTrigger, Settings -> /settings)
             + ActiveWorkspaceView + HomeOverlays + OrderLinkedDeviceLiveWidget
    ActiveWorkspaceView:
      'route-operations'       -> HomeRouteOperationsPage
      'store-pickup'           -> lazy HomeStorePickupPage            ("coming soon" placeholder)
      'international-shipping' -> lazy HomeInternationalShippingPage  ("coming soon" placeholder)
```

The workspace switcher lives only in `home-app/components/mobile/HomeMobileSettingsPage.tsx`. `AdminNotificationClickBridge` also forces route-operations.

`HomeOverlays` (`home-route-operations/components/HomeOverlays.tsx`) renders `popupManager.renderStack({})` inside AnimatePresence. It is the global popup host.

Popup keys in `homePopupRegistry` (`home-route-operations/registry/homePopups.ts`) are the union of:
- plan: `PlanForm`, `CreateRouteGroupForm`, `RouteGroupEditForm`
- order: `order.create`, `order.edit`, `order.item.create`, `order.item.edit`, `order.note.edit`, `order.filter.panel`, `FilterForm`...
- costumer: `costumer.form`
- zone: `zone.form`
- trusted-device: acting-user popups

Section keys in `homeSectionRegistry` (`registry/homeSections.ts`): `order.main`, `order.details`, `orderCases.main`/`oderCase.details` (legacy), `orderCase.main`, `orderCase.orderCases`, `orderCase.details`, `costumer.details`, `RoutePlanPage`, `RouteGroupsPage`.

### Route operations workspace

```
HomeRouteOperationsPage (home-route-operations/pages/HomeRouteOperationsPage.tsx)
 HomeRouteOperationsManagersProvider (providers/HomeRouteOperationsManagersProvider.tsx)
   useRouteOperationsFixtureBootstrap (dev), mapManager = useMap() (shared/map), preloadMapExtras on idle (desktop)
   dnd = useRouteOperationsDndController() -> plan/hooks/usePlanOrderDndController.tsx
   ResourcesManagerProvider{ mapManager, planDropFeedback, unscheduleDropFeedback, routeReorderPreview, routeOperationsActiveDrag }
   DndContext(sensors, homeCollisionDetection [dnd/collisionStrategies: rankedPointer, order, route],
              MeasuringStrategy.Always, autoScroll) + DragOverlay(dropAnimation=null){RouteOperationsDragOverlay}
  AdminNotificationWorkspaceBridge
  HomeRouteOperationsContent -> aurora backgrounds + (isMobile ? HomeMobileView : HomeDesktopView)
```

**HomeDesktopView** (`home-route-operations/views/HomeDesktopView.tsx`)
- Hooks: useMapManager, useSectionManager, useBaseControlls, useOrderSelectionMode, useHomeDesktopDerivedStateFlow, useActivePlanWorkspace, useHomeDesktopLayout (store `homeDesktopLayout.store`), useMapSelectionModeGuardFlow, useHomeDesktopRailSettleFlow, and a "p" shortcut suppression.
- Tree:
  - `RouteGroupWorkspaceRuntime` (plan/routeGroup/providers), only when the open plan is local_delivery. It runs useActiveRouteGroupResourcesController, routeGroupMap.flow and circle selection.
  - `HomeDesktopLayout` (layout/HomeDesktopLayout.tsx -> MapArea, PlanArea, OverlayRail) with these slots:
    - **Map:** `MapPanel` (components/MapPanel.tsx, which hosts MapView) plus overlays. For a local-delivery plan: `RouteGroupMapOverlay` (plan/routeGroup/components). Otherwise: `OrderMapOverlay` (order/components) + `ZoneMapOverlay` (zone).
    - **Plan area:** `PlanDesktopShell` (plan/views/PlanDesktopShell.tsx). It shows `PlanDesktopTimeline`, or `RoutePlanPage` (plan/pages/Plan.page.tsx) with `showViewSwitch` (the calendar/list switch in `PlanHeaderMenu`, D12), or `PlanCalendarPage` (plan/calendar/pages), depending on `usePlanCalendarStore` (container view) and the layout mode.
    - **Order list:** `SectionPanel` > `OrderPage` (order/pages/order.page -> orderMain.page -> OrderProvider + OrderMainHeader + OrderList).
    - **Plan workspace (base panel):** `SectionPanel` > `PlanWorkspacePanel` (components/PlanWorkspacePanel.tsx), which picks from `planWorkspaceRegistry` by plan objective: `local_delivery` -> `RouteGroupsPage` (plan/routeGroup/pages/RouteGroups.page.tsx: RouteGroupPageProvider > header, RouteGroupRail, RouteGroupsPageContent with RouteGroupOrderList and RouteGroupsActionBar); `international_shipping` -> InternationalShippingOrdersPage; `store_pickup` -> StorePickupOrdersPage.
    - **Dynamic sections:** `SectionManagerHost` renders `sectionManager.renderStack({variant:'dynamicSectionPanels'})` (order details, case pages, customer details).
    - Plus the plan toggle `BasicButton` and `MapToggleTab`.

**HomeMobileView** (`views/HomeMobileView.tsx`)
- Portals plus AnimatePresence. It shows the plan workspace (`SectionPanel` > `PlanWorkspacePanel`) when the base panel is open, then `SectionManagerHost`, then the tab roots from `registry/homeMobileTabs.tsx` (`plans` -> `RoutePlanPage showCloseButton=false`, `orders` -> `OrderMainPage`), then `OrderSelectionActionBar` on the orders tab.
- `HomeMobileShell` owns the tabs (Plans, Orders, Alerts, Settings; `home-app/domain/homeMobileTabs.ts`; store `homeMobileShell.store`: activeTab, mountedTabs, so tabs stay mounted), the tab bar with the alerts badge, and back-button layering (`homeMobileBack.flow` uses history.pushState with a depth and popstate to close layers).

**Store or provider behind each panel**

| Panel | Driving store / context |
|---|---|
| Order list | `useOrderStore` (entity), `useOrderListStore`, `useOrderQuery` (orderQuery.store), `useOrderPaginationStore`, `useOrderSelectionStore`, `useOrderGroupUIStore` via OrderProvider/OrderContext and `useVisibleOrders` (orderHooks.store) |
| Plan list / calendar / timeline | `useRoutePlanStore` (entity), `useRoutePlanListStore`, `useRoutePlanPaginationStore`, `useRoutePlanDateFilterUIStore`, `usePlanCalendarStore`, `usePlanOrderMutationStore` (busy plans); `useVisibleRoutePlans` |
| Route groups workspace | `useRouteGroupStore`, `useActiveRouteGroupStore`, `useRouteGroupSelectionStore`, `useRouteSolutionStore`, `useRouteSolutionStopStore`, `routeSolutionPreview`, `routeGroupOverviewFreshness`, `routeGroupIncomingPulse`/`IncomingOrderPlaceholder`, `routeMapRefresh.store` |
| Map | MapBridge (`useMap`) fed by `orderMapMarkers.flow` / `orderMapData.flow` / `orderMapInteraction.store`, `routeGroupMap.flow` / `routeGroupMapInteraction.store` / `routeGroupZonePreview.store`, zone stores, driverLive stores |
| Layout | `homeDesktopLayout.store` (+ `.storage` persistence), `baseControlls` (open plan payload `{planId, freshAfter}`) |

---

## 6. Order -> Plan -> Route Group -> Route Stop data flow

**Entity stores.** All of these use `createEntityStore<T>()` from `@shared-store`, with shape `{byClientId, idIndex(serverId->clientId), allIds}` plus insert, upsert and patch helpers:

| Entity | Store file | Hook |
|---|---|---|
| Order | `features/order/store/order.store.ts` | `useOrderStore`; helpers setOrder, upsertOrders, selectOrderByServerId |
| Order states | `order/store/orderState.store.ts` | `useOrderStateStore` |
| Order events | `order/store/orderEvent.store.ts` | — |
| Items | `order/item/store/item.store.ts` | `useItemStore`, replaceItemsForOrder, selectItemsByOrderId |
| Plan (DeliveryPlan / RoutePlan) | `plan/store/routePlan.slice.ts` | `useRoutePlanStore`, selectRoutePlanByClientId |
| Plan states | `plan/store/routePlanState.store.ts` | — |
| Route group | `plan/routeGroup/store/routeGroup.slice.ts` | `useRouteGroupStore` (+ snapshot/restore) |
| Route solution | `plan/routeGroup/store/routeSolution.store.ts` | `useRouteSolutionStore` |
| Route stop | `plan/routeGroup/store/routeSolutionStop.store.ts` | `useRouteSolutionStopStore` (upsert/remove by order id) |

List stores use `createListStore` (stats, query, pagination, loading, error): `order/store/orderList.store.ts` and `plan/store/routePlanList.store.ts`. UI stores are plain zustand (selection, map interaction, pagination, group UI, linked-device, and so on).

**DnD pipeline**
1. `DndContext` sits in `home-route-operations/providers/HomeRouteOperationsManagersProvider.tsx`. Its handlers come from `plan/hooks/usePlanOrderDndController.tsx` (Mouse and Touch sensors, active drag, `planDropFeedback`, `unscheduleDropFeedback`, `routeReorderPreview`, selection-batch payloads from `order/store/orderSelection.store` and `orderSelectionHooks.store`).
2. Draggables: `DraggableOrderCard` (order barrel), route stop cards in `plan/routeGroup/components/cards`, plan cards and calendar day cells as droppables. IDs come from `plan/dnd/domain/droppableIds.ts`. Highlighting uses `plan/dnd/controllers/useDroppableTargetHighlight.controller.ts`.
3. `plan/dnd/controller/resolveDropIntent.ts` (645 lines) returns `{type:'intent'|'warning'|'noop'}`, with helpers `resolveCalendarDayDropIntent` and `plan/dnd/domain/*` (resolveMovePosition, resolveGroupPlacement, resolveDraggedOrderOwnership, resolveRouteGroupPlanId, ...) and `plan/domain/planDndIntent`.
4. `plan/controllers/useExecutePlanDndIntent.ts` switches on `intent.kind`:

| Intent | Calls | Backend |
|---|---|---|
| `MOVE_ROUTE_STOP` | `updateRouteStopPositionOptimistic` (`plan/routeGroup/controllers/routeSolutionStop.controller.ts`) | `PATCH /route_operations/route-stops/{id}/position/{pos}` |
| `MOVE_ROUTE_STOP_GROUP` | `updateRouteStopGroupPositionOptimistic` (same file) | `PATCH /route_operations/route-stops/group-position` |
| `ASSIGN_ORDER_TO_PLAN` / `UNSCHEDULE_ORDER` | `updateOrderDeliveryPlan(orderClientId, planId or null)` (`order/controllers/orderMutations.controller.ts`) | `@shared-api` `createOrdersApi`: `/order_assignments/orders/{id}/plan/{planId}` and `/order_assignments/orders/{id}/unassign-plan` |
| `ASSIGN_ORDERS_TO_PLAN_BATCH` / `UNSCHEDULE_ORDERS_BATCH` | `updateOrdersDeliveryPlanBatch` (`order/controllers/orderBatchDeliveryPlan.controller.ts`); selection resolved via `/order_assignments/selection/resolve` | `/order_assignments/plans/{planId}...`. When the origin is `route_group`, item labels are also auto-downloaded with the `item_rescheduled` event. |
| `CREATE_PLAN_FOR_DATE` (calendar drop) | `usePlanController().createPlan(buildCalendarPlanDefaults(...))`, then `normalizePlanCreateBundle` | — |
| `MOVE_ORDER_TO_ROUTE_GROUP` | `moveOrderToRouteGroup` (`plan/routeGroup/actions/moveOrderToRouteGroup.action.ts` via `useMoveOrderToRouteGroup.controller`) | `PATCH /order_assignments/plans/{planId}/batch`, then `syncRouteGroupSummaries.flow` and `applyOrderBatchMoveStateSync.action` |

**Optimistic updates.** `optimisticTransaction` from `@shared-optimistic` follows a snapshot -> apply -> request -> commit or rollback pattern. It is used in:
- `order/controllers/order.controller.ts` (create and edit, 4 sites)
- `order/controllers/orderMutations.controller.ts` (single plan assignment)
- `order/controllers/orderBatchDeliveryPlan.controller.ts` (batch assignment)
- `plan/routeGroup/actions/moveOrderToRouteGroup.action.ts` (snapshot of orders + route groups; restore inside `unstable_batchedUpdates`)
- `plan/routeGroup/controllers/routeSolutionStop.controller.ts` (stop and stop-group reorder)
- `plan/routeGroup/controllers/routeGroupSettings.controller.ts`

Helpers:
- `order/utils/orderOptimisticSnapshot.ts`, `order/utils/orderPlanAssignmentOptimistic.ts` (`applyOptimisticOrderPlanAssignment`).
- `plan/flows/runWithPlanOrderMutation.flow.ts` marks the source and target plans busy in `usePlanOrderMutationStore` while the request runs.
- `plan/flows/runPlanDndMoveWithHandoff.flow.ts` handles the move handoff.
- `plan/routeGroup/flows/runWithRouteMapRefresh.flow.ts` together with `routeMapRefresh.store` show the route-map refreshing state.

**Other flows**
- Plan bridges (`plan/bridges/orderCreation|orderUpdate|orderDelete|orderRouteArtifacts.bridge.ts`) propagate order CRUD into plan and route artifacts. `handlePlanOrderCreation` is exported.
- Route group read path: `routeGroupPageInitialization.flow`, `routeGroupOverview.flow`, `routeGroupDetails.flow`, `activeRouteGroupDetailsHydration.flow`, `routeSolutionRead.flow`, `syncActiveRouteGroupSelection` / `ZonePreview` / `RouteSolutionSelection` flows, and `domain/mergeServerRouteStops.ts`.
- Route group API: `plan/routeGroup/api/routeGroup.api.ts` (`/route_plans/{id}/route-groups[...]`, `/materialize`), `routeSolution.api.ts` (`/route_operations/...`, `/route_solutions/{id}`), `routeOptimization.api.ts`, `planOverview.api.ts`, `routeGroupSettings.api.ts`.
- Realtime refreshes go through the AdminBusinessRealtimeProvider dedupers (§4).

---

## 7. Printing / labels / export

| Concern | What exists | Where |
|---|---|---|
| PDF engine | jsPDF (dynamic import) draws labels and sheets in **cm**, one page per data item. html2canvas + jsPDF render React components to a PDF blob. | `features/templates/printDocument/controllers/renderPdfDocument.controller.ts`, `renderComponentToPdfBlob.controller.ts`, `downloadBlob.controller.ts` (anchor download); typings in `src/types/pdf-libs.d.ts` |
| Template model | Channels `item`, `order`, `route` (`domain/templateChannel.map.ts`). Events `item_created`, `item_edited`, `item_rescheduled`, `route_solution_for_printing` (`domain/templateEvent.map.ts`). Orientation horizontal or vertical. Active template per channel and event, loaded from bootstrap `label_templates` and `printTemplate.api`, stored in `printDocument.store`. | `templates/printDocument/{types,domain,store,api}` |
| Variants | Item labels: `classic` (5x7 cm, vertical, **barcode placeholder box only**, no real barcode) and `7cm - 10cm` (labelled 7.5x5 cm, horizontal). Order: `classic` with a no-op draw. Route sheets: **Drivers A4** and **Packers A4** (21x29.7). | `domain/templateVariants.map.ts`; draw fns in `components/templates/item/classicTemplateItem.pdf.ts`, `sevenByTenTemplateItem.pdf.ts`, `components/templates/route/driversTemplateRoute.pdf.ts`, `packersTemplateRoute.pdf.ts`, `routeTemplate.shared.ts` |
| Event-driven download | `useDownloadTemplateByEventFlow().downloadByEvent({channel,event,data,fileName,onProgress})` resolves the active template and variant, renders the PDF and calls downloadBlob. It is silent when no template exists unless `notifyWhenTemplateMissing` is set. | `templates/printDocument/flows/downloadByEvent.flow.ts` |
| Item labels | `downloadItemLabels.flow` / `startItemLabelDownload.flow`, with domain `itemsForDownloading`, `itemLabelExpansion`, `labelPlanObjective` (tested). Triggered from OrderForm submit (`order/forms/orderForm/controllers/useOrderFormSubmit.actions.ts` + `orderFormSubmitFeedback.presenter.ts`: item_created, item_edited), ItemForm submit (`order/item/popups/ItemForm/useItemFormSubmit.ts`), `ItemsOrderPreview` (manual print with `ItemPrintProgressIcon`), and DnD batch assignment from a route group (item_rescheduled). | `features/order/item/...` |
| Route sheet | "Print route" in the route group header calls `handlePrintRouteSolution`, which runs `serializeRouteSolutionForTemplate(planId, routeGroupId)` and then `downloadByEvent({channel:'route', event:'route_solution_for_printing'})`. | `plan/routeGroup/components/pageHeaders/routeGroupPageHeader.tsx`, `plan/routeGroup/actions/useRouteGroupPageActions.tsx`, `plan/routeGroup/domain/serializeRouteSolutionForTemplate.ts` (tested) |
| Template config UI | Settings `/settings/print-templates[/:channel[/:event]]`: PrintTemplateMainPage, ChannelPage, ConfigPage (variant selector, preview, save). | `templates/printDocument/pages`, `components/config` |
| Import/export | CSV **import** of orders only (`order/components/OrderImportButton.tsx`, `order/api/orderImport.api.ts` uploadOrderCsv, `orderImport.controller`). No CSV/XLSX export was found. | — |
| **Absent** | `window.print`, `@media print`, `navigator.bluetooth`/`serial`/`usb`/`hid`, ESC/POS, ZPL, TSPL, real QR or barcode generation (no library; only a placeholder rectangle in the classic label), "etiqueta". Output is always a downloaded PDF file. | — |

The theme codemods exclude `features/templates/printDocument/`, `messaging/emailMessage/components/` and `shared/map/`.

---

## 8. Scripts (`admin-app/scripts`)

| Script | What it does |
|---|---|
| `check-external-form-pwa.mjs` | Checks the external-form manifest against the contract, the scope (not `/`), the icons, and that the notification SW has no fetch/caches and keeps push/notificationclick. Forbids `public/sw.js`, `public/service-worker.js` and `public/pwa-sw.js` (details in §1). |
| `check-feature-popup-architecture.mjs` | `src/shared/popups/featurePopup/*` must not import features. `useFeaturePopupCloseController(` may only be called in `src/features/**/popups/**`. `FeaturePopupClosePrompt` may only be mounted in popup roots (or inside featurePopup itself). |
| `theme-codemod.mjs` (`--check`) | Uses `theme-map.json` to replace Tailwind palette utilities (`bg-slate-500`, ...) with theme tokens. In check mode it fails if any remain. |
| `theme-arbitrary-hex-codemod.mjs` (`--check` / `--write`) | Maps arbitrary `bg-[#hex]` classes to CSS variables (`--accent`, ...). |
| `theme-shadow-codemod.mjs` (`--check` / `--write`) | Maps arbitrary shadow classes to `--shadow-*` tokens. |
| `theme-functional-color-codemod.mjs` (`--write`) | Replaces `rgba()` literals with tokens (`--rule`, `--glass-*`, ...). |
| `theme-functional-color-guard.mjs` | Fails when an rgba() literal is not in `theme-functional-color-allowlist.json`. |
| `theme-map.json`, `theme-functional-color-allowlist.json` | Data files for the scripts above. |

`npm run theme:regression` runs the three `--check` codemods plus the guard.

---

## 9. Tests

- **96** `*.test.ts(x)` files, colocated in `tests/` folders next to the layer (also `plan/bridges/__tests__`). Counts: order 36, plan 16, shared/calendar 11, costumer 9, auth 5, shared/map 4, zone 3, home-route-operations 3, messaging 2, itemConfigurations 2, and one each in shared/overlays, realtime/driverLive, home-app, externalForm and app/pwa.
- **Framework-less convention:** no vitest, jest or node:test imports. Each file exports `run…Tests()` with a local `assert(condition, message)` helper; 95 of 96 follow it. The convention is documented in `Front_end/docs/TRUSTED_DEVICE_MULTI_USER_SESSIONS.md`.
- The files sit under `src`, so `tsc -b` (the build) type-checks them. **There is no npm test script and no runner is wired**; they have to be invoked ad hoc (for example via a tsx/node harness). Some use `react-dom/server` `renderToStaticMarkup`.

---

## 10. driver-app (pattern reference)

`/Users/davidloorenz/Desktop/Developer/BeyoApps_2025/NextMark-app-v2/Front_end/driver-app`

- **PWA:** `vite-plugin-pwa` in `vite.config.ts`. Settings: `registerType:'autoUpdate'`, `injectRegister:false`, dev disabled.
  - Manifest is inline: id, scope and start_url all `/`, standalone, portrait, theme `#1f6f5d`, bg `#f3ede2`, icons 192/512 plus a maskable 512.
  - Workbox precaches `**/*.{js,css,svg,png,ico,webmanifest}`, ignores `index.html`, has `navigateFallback:null` and no runtimeCaching, and sets `skipWaiting` and `clientsClaim`.
  - Registration is in `src/main.tsx` via `virtual:pwa-register` `registerSW`, with a reload on `controllerchange`.
  - Install prompt: `src/app/pwa/usePwaInstallPrompt.ts` (`beforeinstallprompt` / `appinstalled`).
  - Icons live in `public/`. There is no separate push SW file.
- **Shell** (`src/app/shell/`): a store-driven surface system. Surfaces are `bottom-sheet` (snaps collapsed, workspace, expanded; motion idle, dragging, snapping), `side-menu`, `sliding-page` and `overlay`.
  - One action per file in `actions/` (open/push/pop/replace bottom sheet, set snap/height, open/close overlay, sliding page, side menu, `handleSurfaceBack`, `locateCurrentLocation`).
  - Zustand `stores/shell.store` with mutations and selectors; controllers `useBottomSheetSurface`, `useMapSurface`, `useDriverAppShellChrome`.
  - `domain/bottomSheetContentGesture.ts` arbitrates between the sheet drag and inner scrolling via `data-bottom-sheet-scroll-root` / `data-bottom-sheet-gesture-lock` and skips editable elements. `shell.config.ts` and `shell.types.ts` (typed page-id -> params maps).
  - Components: DriverAppShell, BottomSheetSurface, SlidingPageSurface, OverlaySurface, MapSurface, SideMenuSurface; `flows/initializeDriverShell.flow.ts`.
- **Printing / bluetooth:** none (no jspdf, `window.print`, or bluetooth/serial/usb).
- **Implication for admin:** copying the driver-app's vite-plugin-pwa setup would emit a root-scope workbox `sw.js` that competes with `/admin-notifications-sw.js` and conflicts with the "no caching" rule enforced by `check-external-form-pwa.mjs`.
