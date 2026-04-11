# NextMark Frontend — Documentation

This folder is the documentation root for the entire `Front_end` workspace.
Each application and the shared packages directory maintains its own `docs/` sub-tree, linked from here.

---

## Applications

| App | Index |
|---|---|
| Admin App | [admin-app/docs/README.md](../admin-app/docs/README.md) |
| Driver App | [driver-app/docs/README.md](../driver-app/docs/README.md) |
| Client Form App | [client-form-app/docs/README.md](../client-form-app/docs/README.md) |
| External Operations App | [external-operations-app/docs/README.md](../external-operations-app/docs/README.md) |
| Tracking Order App | [tracking-order-app/docs/README.md](../tracking-order-app/docs/README.md) |

## Shared Packages

| Section | Index |
|---|---|
| Packages | [packages/docs/README.md](../packages/docs/README.md) |

---

## Workspace-level references

| Document | Description |
|---|---|
| [AGENTS.md](../AGENTS.md) | Frontend architecture rules governing all apps and packages in this workspace |
| [APP_SCOPED_SESSIONS.md](../APP_SCOPED_SESSIONS.md) | App-scoped session model and conventions |
| [GPT_AI_PANEL_RESPONSE_CONTRACT.md](GPT_AI_PANEL_RESPONSE_CONTRACT.md) | AI panel backend response contract specification |

---

## Planned workspace-level docs

The following documents will be added here as development progresses.

- `architecture-overview.md` — workspace dependency graph, shared package boundaries, and data-flow diagram
- `onboarding.md` — local dev setup, environment variables, and toolchain requirements
- `deployment.md` — build pipeline, per-app deployment targets, and environment management
- `testing-strategy.md` — per-layer testing expectations across all apps
- `adr/` — architecture decision records for significant cross-app decisions
