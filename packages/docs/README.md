# Shared Packages — Documentation

Documentation index for the `packages/` shared library tree.

← [Back to workspace docs](../../docs/README.md)

---

## Package index

| Package | Import alias | Docs index |
|---|---|---|
| `ai-panel` | — (internal, consumed by apps) | [ai-panel/docs/README.md](../ai-panel/docs/README.md) |
| `shared-api` | `@shared-api` | — |
| `shared-domain` | `@shared-domain` | — |
| `shared-google-maps` | `@shared-google-maps` | — |
| `shared-icons` | `@shared-icons` | — |
| `shared-inputs` | `@shared-inputs` | — |
| `shared-message-handler` | `@shared-message-handler` | — |
| `shared-optimistic` | `@shared-optimistic` | — |
| `shared-realtime` | `@shared-realtime` | — |
| `shared-store` | `@shared-store` | — |
| `shared-utils` | `@shared-utils` | — |

## Feature documentation

| Document | Description |
|---|---|
| [ai-panel/docs/README.md](../ai-panel/docs/README.md) | AI panel package — full documentation index |
| [ai-panel/CONTEXT.md](../ai-panel/CONTEXT.md) | AI panel package — architecture, component tree, conversation hook, and capability model |
| [ai-panel/AI_PANEL_BACKEND_BLOCKS_CONTRACT.md](../ai-panel/AI_PANEL_BACKEND_BLOCKS_CONTRACT.md) | Backend block contract — all supported block kinds and rendering expectations |
| [ai-panel/AI_PANEL_STATISTICS_BLOCKS_CONTRACT.md](../ai-panel/AI_PANEL_STATISTICS_BLOCKS_CONTRACT.md) | Statistics block contract — analytics layout variants and data shape specifications |
| [GPT_AI_PANEL_RESPONSE_CONTRACT.md](../../docs/GPT_AI_PANEL_RESPONSE_CONTRACT.md) | AI panel backend response contract specification |

---

## Package boundary rules

All shared packages must remain framework-agnostic and app-independent.
See [AGENTS.md](../../AGENTS.md) for the full shared package boundary rules.

Allowed consumers: `admin-app`, `driver-app`, `client-form-app`, `external-operations-app`, `tracking-order-app`.

---

## Planned docs

The following documents will be added here as the packages evolve.

- `shared-domain.md` — core domain types, order states, delivery planning contracts
- `shared-api.md` — transport-safe API wrappers, request/response contracts
- `shared-realtime.md` — realtime channel model, subscription lifecycle, reconnect strategy
- `shared-optimistic.md` — optimistic update model and retry orchestration
- `shared-store.md` — cross-app Zustand store factory patterns
- `shared-utils.md` — pure utility catalogue
- `shared-google-maps.md` — Google Maps integration: Places, Geocoding, route display
