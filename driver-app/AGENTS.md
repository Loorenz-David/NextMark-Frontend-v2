# Driver App Shell Architecture Rules

These rules apply specifically to `driver-app`.

`driver-app` inherits the frontend-wide architecture rules from `Front_end/AGENTS.md`.

This file adds driver-specific shell and surface architecture rules only.

## Core Rule

The driver application uses a shell + surface architecture.

The shell owns layout surfaces, navigation stacks, focus, and gesture coordination.

Features render content inside shell-managed surfaces but must not control layout infrastructure directly.

## Transitional Rule

The current `AppShell` is transitional infrastructure.

Future shell work must move the app toward `DriverAppShell`.

Do not deepen the current simple route-layout shell in ways that conflict with the target surface model.

New layout infrastructure must be added through shell evolution, not through feature-owned containers.

## DriverAppShell Responsibility

`DriverAppShell` is the root layout controller for the driver application.

The shell is infrastructure, not a feature.

The shell is the sole owner of:

- `MapSurface`
- `BottomSheetSurface`
- `SideMenuSurface`
- `OverlaySurface`
- gesture coordination between surfaces
- surface focus
- surface navigation stacks

The shell decides where features render.

Features must not manipulate layout surfaces directly.

Example shell structure:

```text
DriverAppShell
 ├ MapSurface
 ├ BottomSheetSurface
 ├ SideMenuSurface
 └ OverlaySurface
```

## Shell Store Contract

Shell infrastructure state belongs in a dedicated shell-level store.

Example placement:

- `driver-app/app/shell/shell.store.ts`

The shell store is the single source of truth for shell navigation and shell UI coordination state.

The shell store may contain:

- `bottomSheetStack`
- `sideMenuStack`
- `overlayStack`
- bottom sheet snap state
- surface focus state
- shell-level coordination state

Feature stores must not hold shell navigation state.

Shell state and feature state must remain separated.

## Shell Navigation State Contract

Surface navigation stacks must be stored in the shell-owned state container.

Surface stacks include:

- `bottomSheetStack`
- `sideMenuStack`
- `overlayStack`

Features must not create their own navigation stacks or duplicate shell navigation state.

The shell is the single source of truth for surface navigation state.

## Shell Navigation Contract

Features must request surface navigation through shell actions.

Allowed shell actions include:

- `openBottomSheet(page, params)`
- `pushBottomSheet(page, params)`
- `openSideMenu(page)`
- `closeSideMenu()`
- `openOverlay(page, params)`
- `closeOverlay()`
- `setBottomSheetSnap("collapsed")`
- `setBottomSheetSnap("workspace")`
- `setBottomSheetSnap("expanded")`

Features must not:

- directly manipulate surface containers
- mount layout surfaces themselves
- implement their own navigation stacks
- bypass shell navigation state

## Surface Model

The driver UI is composed of four shell-owned surfaces.

### MapSurface

The map is the workspace background.

Responsibilities:

- render the map view
- react to bottom sheet size changes
- expose map APIs through shell-approved controllers when needed

The map must not be owned by features.

### BottomSheetSurface

The bottom sheet is the primary feature workspace.

Responsibilities:

- drag gesture logic
- snap point logic
- map resize coordination
- rendering bottom sheet stack pages

### SideMenuSurface

The side menu is the right-side navigation surface.

Responsibilities:

- right-to-left open/close behavior
- side menu stack rendering
- navigation, profile, settings, and workspace controls

### OverlaySurface

The overlay surface renders blocking or modal workflows.

Examples:

- camera scanning
- confirmation dialogs
- authentication prompts
- permission requests
- login
- onboarding

Overlay pages cover the full screen and block lower-surface interaction.

## Surface Lifecycle Contract

Surface containers are persistent shell infrastructure.

Examples:

- `MapSurface`
- `BottomSheetSurface`
- `SideMenuSurface`
- `OverlaySurface`

Surface containers stay mounted for the lifetime of the application.

Surface pages rendered inside stacks may mount and unmount as navigation changes.

Features must not assume their surface page remains mounted after navigation changes.

State that must survive navigation belongs in feature stores, not in surface page components.

## Surface Navigation Stacks

Each shell surface manages its own navigation stack.

Example:

```text
bottomSheetStack
  OrdersList
  OrderDetails
  RouteStops

sideMenuStack
  MenuHome
  DriverProfile
  Settings

overlayStack
  Scanner
  ConfirmStop
  ErrorDialog
```

Features render pages inside these stacks but do not control stack mechanics.

## Bottom Sheet Snap Contract

Bottom sheet drag and snap behavior is owned by `BottomSheetSurface`.

Snap points are:

- `collapsed = 10%`
- `workspace = 25%`
- `expanded = 95%`

Behavior rules:

- the sheet is draggable by the handle indicator
- releasing drag snaps to the nearest step based on user intent
- the map shrinks while the sheet expands until the `workspace` threshold
- above the `workspace` threshold the map remains fixed while the sheet continues expanding

Features must not control drag mechanics or snap logic directly.

Features may request snap changes through shell actions only.

Bottom sheet height, drag gestures, snapping, and map resize coordination remain shell responsibilities.

## Surface Back Navigation Contract

Back navigation must follow a consistent surface priority.

Back navigation closes surfaces in this order:

1. `overlayStack`
2. `sideMenuStack`
3. `bottomSheetStack`
4. app-level navigation

If an overlay is open, the first back action closes the overlay.

If the side menu is open, the next back action closes the side menu.

If the bottom sheet stack can pop or collapse according to shell rules, that occurs before app-level navigation.

Shell and surface controllers own this coordination.

Features must not implement their own conflicting back behavior for shell surfaces.

## Surface Focus Rule

The shell controls which surface has interaction focus.

When a blocking surface is active:

- lower surfaces must not receive input events
- interaction is limited to the active surface

Examples:

- when an overlay is open, bottom sheet and map interactions are disabled
- when the side menu is open, map gestures must not interfere with menu interaction

Focus management belongs to the shell or surface controllers.

Features must not implement competing focus rules.

## Surface Ownership Rule

Surface infrastructure belongs to the shell.

Surfaces must not be created or controlled by features.

Forbidden examples:

- a feature resizing the bottom sheet directly
- a feature mounting its own overlay container
- a feature implementing bottom sheet drag behavior
- a feature implementing an alternate side menu surface

Features should only render content for a surface.

## Feature Surface Declaration

Each feature should clearly belong to one or more surfaces.

Examples:

```text
features/orders
  surface: bottom-sheet

features/settings
  surface: side-menu

features/scanner
  surface: overlay
```

Features must not attempt to render across multiple surfaces unless the shell explicitly coordinates it.

## Layout Independence Rule

Features must remain layout-agnostic.

Feature components should not assume:

- bottom sheet height
- map visibility
- side menu visibility
- overlay visibility
- direct control over shell layout state

The shell controls layout behavior.

## Gesture Ownership Rule

Gesture handling belongs to the shell or surface controllers.

Examples:

- bottom sheet drag gestures
- swipe to open menu
- overlay dismissal gestures

Features must not implement gestures that conflict with shell surfaces.

## Map Interaction Contract

The map is owned by `MapSurface` and is shell infrastructure.

Features must not manipulate the map surface container or layout directly.

Features may request map operations through controllers or flows.

Allowed operations include:

- centering the map on an entity
- highlighting a route or stop
- updating markers
- focusing on driver location

Forbidden operations include:

- resizing the map container
- changing map layout styles directly
- accessing DOM layout of the map surface

Map resizing and positioning are coordinated by the shell and surfaces, not by features.

## Absolute Page Container

Flows that require a full-screen page above all surfaces must render inside `OverlaySurface`.

These pages occupy:

- `100%` width
- `100%` height

Examples:

- login
- onboarding
- camera scanner

## Expandability Rule

New surfaces may be added only through `DriverAppShell`.

Do not introduce feature-specific layout containers that compete with shell surfaces.

All future layout infrastructure must be integrated through `DriverAppShell`.

## Forbidden Patterns

The following are not allowed in `driver-app`:

- feature-owned navigation stacks for shell surfaces
- feature-owned bottom sheet drag or snap logic
- feature-owned overlay containers
- feature-owned side menu containers
- feature-owned map layout resizing
- shell navigation state stored in feature stores
- feature pages assuming persistent mounting inside surface stacks
- direct DOM manipulation of shell surfaces from feature code

## Review Standard

When implementing or reviewing driver-app changes:

- check shell ownership before code style
- reject feature code that creates competing surface infrastructure
- keep shell state separate from feature state
- keep surface containers persistent and treat surface pages as disposable
- prefer evolving `AppShell` toward `DriverAppShell` over adding one-off layout shortcuts
