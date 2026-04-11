# Admin App — Documentation

Documentation index for the `admin-app` application.

← [Back to workspace docs](../../docs/README.md)

---

## Existing references

| Document                                                  | Description                                        |
| --------------------------------------------------------- | -------------------------------------------------- |
| [README.md](../README.md)                                 | App overview and quick-start guide                 |
| [COSTUMER_CONTEXT.md](../COSTUMER_CONTEXT.md)             | Customer context model and data contracts          |
| [IMPLEMENTATION_CONTEXT.md](../IMPLEMENTATION_CONTEXT.md) | Implementation context and architectural decisions |
| [MESSAGING_CONTEXT.md](../MESSAGING_CONTEXT.md)           | Messaging model and realtime event contracts       |
| [AGENTS.md](../../AGENTS.md)                              | Frontend architecture rules (workspace-level)      |

## Feature documentation

| Document                                                                                     | Description                                                                    |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [features/ai/CONTEXT.md](../src/features/ai/CONTEXT.md)                                      | Admin AI panel feature — architecture, layer map, adapter, and block rendering |
| [implemented/ZONE_ROUTEGROUP_ARCHITECTURE.md](./implemented/ZONE_ROUTEGROUP_ARCHITECTURE.md) | Current source of truth for zone-aware route planning architecture             |

## Under development

| Document                                                                                             | Description                                                        |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [under_development/ZONE_CREATION_MODE_PLAN.md](./under_development/ZONE_CREATION_MODE_PLAN.md)       | Zone creation mode — drawing, optimistic create, hover, edit popup |

---

## Archive

| Document                                                                                   | Description                                       |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| [archive/ZONES_FRONTEND_CONTEXT_AND_PLAN.md](./archive/ZONES_FRONTEND_CONTEXT_AND_PLAN.md) | Historical migration planning document (archived) |

---

## Planned docs

The following documents will be added here as the app evolves.

- `architecture.md` — feature map, layer diagram, and dependency boundaries
- `features/orders.md` — order management feature: flows, forms, state, and API contracts
- `features/delivery-planning.md` — delivery planning feature: routing, stops, assignment flows
- `features/customers.md` — customer management feature
- `features/analytics.md` — admin analytics views and AI-driven insights
- `api-contracts.md` — backend endpoints consumed by this app
- `deployment.md` — build configuration, environment variables, and deployment targets
- `testing.md` — test strategy and coverage expectations per layer
