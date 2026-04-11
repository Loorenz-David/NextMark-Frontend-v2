# Driver App — Documentation

Documentation index for the `driver-app` application.

← [Back to workspace docs](../../docs/README.md)

---

## Existing references

| Document | Description |
|---|---|
| [README.md](../README.md) | App overview and quick-start guide |
| [AGENTS.md](../AGENTS.md) | Driver app-specific architecture rules |

---

## Planned docs

The following documents will be added here as the app evolves.

- `architecture.md` — workspace model (team-driver vs independent-driver), feature map, and layer diagram
- `features/route.md` — assigned route display, stop sequencing, arrival and departure flows
- `features/navigation.md` — in-app map rendering, external navigation deep-links (Google Maps, Apple Maps, Waze)
- `features/location.md` — driver location publishing, throttled GPS updates, and geofencing
- `features/orders.md` — order acceptance, confirmation, and status state machine
- `features/offline.md` — offline behavior, queue management, and sync-on-reconnect
- `api-contracts.md` — backend endpoints consumed by this app
- `deployment.md` — build configuration, PWA config (service worker), and deployment targets
- `testing.md` — test strategy and coverage expectations per layer
