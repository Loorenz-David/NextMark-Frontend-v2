# Admin AI Feature — Developer Context

Feature path: `admin-app/src/features/ai/`
Last updated: 2026-03-24

---

## What this feature is

Admin integration layer between backend thread APIs and `@nextmark/ai-panel`.
It owns:

- raw API calls
- DTO normalization
- provider wiring for panel transport + action resolution
- admin-specific structured block rendering
- order-row UI actions from AI blocks (open detail)

---

## Layer map

```
AdminAiPanelProvider
  ├─ adminAiPanelTransport (domain/adminAiPanelAdapter.ts)
  │    ├─ createThread -> POST /ai/threads
  │    ├─ sendMessage  -> POST /ai/threads/:id/messages
  │    └─ loadThread   -> GET  /ai/threads/:id
  ├─ resolveAction (navigate/open_settings/apply_order_filters/copy_text)
  ├─ dev fixture transport override (`/fixture`, dev only)
  ├─ mapLegacyDataToBlocks (legacy data fallback mapper)
  └─ renderBlock -> AdminAiBlockRenderer
        ├─ useAiOrderRowClick.controller
        │    └─ resolveAiOrderDetailPayload
        └─ renderAdminAiBlock (pure renderer)
             ├─ AiOrderCard
             └─ AiOrdersTable
             ├─ AiAnalyticsNarrativeBlock
             ├─ AiAnalyticsKpi
             ├─ AiAnalyticsMetricGrid
             ├─ AiAnalyticsBarList
             └─ AiAnalyticsTable
```

---

## Backend protocol summary

Endpoints (via `ai.api.ts`):

| Operation | Method | Path |
|---|---|---|
| Create thread | POST | `/ai/threads` |
| Send message | POST | `/ai/threads/:id/messages` |
| Reload thread | GET | `/ai/threads/:id` |

Transport maps these into the package `AiTransportAdapter` contract.

---

## Normalization responsibilities

`domain/adminAiPanelAdapter.ts` is the only backend->panel normalization boundary.

Key mappings:

- `normalizeV2Response` -> `AiPanelResponse`
- `normalizeV2Block` -> `AiMessageBlock`
- `normalizeAiAnalyticsBlockData` -> strict analytics layout data shape validation
- `normalizeV2Action` -> `AiActionDescriptor`
- `normalizeV2ToolTrace` -> `AiToolTraceEntry`

Message fields normalized for panel rendering:

- `intent`
- `narrativePolicy`
- `renderingHints`
- `typedWarnings`
- `blocks`

No UI component should consume raw DTO types from `types/ai.ts` directly.

Important detail:

- canonical `kind: 'analytics'` blocks with `entity_type: 'analytics'` and supported `layout` values are normalized through `normalizeAiAnalyticsBlockData`
- legacy analytics fixture kinds (`analytics_kpi`, `analytics_trend`, `analytics_breakdown`) are passed through as-is and rendered on the admin side by `renderAdminAiBlock`

---

## Action resolution in provider

`providers/AdminAiPanelProvider.tsx` handles standard action types:

- `navigate`
- `open_settings`
- `apply_order_filters`
- `copy_text`

`apply_order_filters` uses `normalizeApplyOrderFiltersPayload` so search text and filters are separated cleanly before store updates.

Internal interaction actions (`interaction:*`) are still handled by the package hook and do not pass through provider `resolveAction`.

In dev mode, `AdminAiPanelProvider` also intercepts `/fixture` commands and returns normalized local fixture payloads without calling the backend thread message endpoint.

---

## Order row click behavior from AI blocks

Current behavior:

1. AI order blocks render via `AdminAiBlockRenderer`.
2. Wrapper hook `useAiOrderRowClick` injects an `onOrderRowClick` callback into the pure renderer.
3. `renderAdminAiBlock` forwards callback into `AiOrdersTable` rows and `AiOrderCard` cards.
4. Click/keyboard open `order.details` through section manager.
5. Identifier resolution:

- prefer `client_id`
- fallback to numeric `id`
- no-op when neither exists

This keeps side effects in controller layer and UI components presentational.

---

## Capability context passthrough

`@nextmark/ai-panel` now sends capability context fields per message:

- `context.capability_mode`
- `context.capability_id` (manual mode)

This feature transport already forwards `context` to backend unchanged.

This provider currently uses package default capability options and does not override `capabilityOptions`.

The provider also does not currently configure package diagnostics, loading-status polling, or message retention overrides; package defaults apply.

---

## File reference

| File | Responsibility |
|---|---|
| `providers/AdminAiPanelProvider.tsx` | Feature entrypoint; mounts panel with transport, resolver, block renderer |
| `components/AdminAiBlockRenderer.tsx` | Hook-safe wrapper that injects row-click action callback |
| `components/renderAdminAiBlock.tsx` | Pure AI block renderer for order blocks plus admin analytics blocks (canonical + legacy fixture kinds) |
| `components/AiAnalyticsNarrativeBlock.tsx` | Presentational narrative summary block for analytics text sections |
| `components/AiAnalyticsKpi.tsx` | Presentational legacy KPI stat block renderer |
| `components/AiAnalyticsMetricGrid.tsx` | Presentational KPI metric-grid renderer |
| `components/AiAnalyticsBarList.tsx` | Presentational ranked analytics bar-list renderer |
| `components/AiAnalyticsTable.tsx` | Presentational analytics table renderer |
| `components/AiOrderCard.tsx` | Presentational order card with optional click/keyboard interaction |
| `components/AiOrdersTable.tsx` | Presentational order table with optional row click/keyboard interaction |
| `controllers/useAiOrderRowClick.controller.ts` | Side-effect controller for opening order detail section |
| `domain/resolveAiOrderDetailPayload.ts` | Pure resolver for clientId/serverId payload extraction |
| `domain/adminAiPanelAdapter.ts` | DTO normalization + transport adapter implementation |
| `domain/normalizeAiAnalyticsBlockData.ts` | Canonical analytics data guards/normalization by layout |
| `domain/normalizeApplyOrderFiltersPayload.ts` | apply_order_filters payload normalization |
| `domain/statisticalNarrative.fixtures.ts` | Dev-only structured AI fixture responses used by `/fixture` commands |
| `api/ai.api.ts` | Raw HTTP calls |
| `types/ai.ts` | Raw backend DTO contracts |
