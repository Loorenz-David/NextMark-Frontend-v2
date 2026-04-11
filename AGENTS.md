# Frontend Architecture Rules

These rules apply to all frontend work inside `Front_end/`.

## Core Rule

Before implementing a frontend change, classify the logic by responsibility first and place it in the correct layer. Do not start by adding code to the nearest existing file.

If a change introduces mixed responsibilities, split it before continuing.

## Shared Package Boundaries

The `packages/` folder is the source of truth for cross-app stable frontend logic.

- `admin-app` and `driver-app` may import from `packages`
- code in `packages` must never import from `admin-app` or `driver-app`
- consumers must import only from package root barrels
- deep imports into package internals are forbidden

Allowed package imports:

- `@shared-domain`
- `@shared-api`
- `@shared-store`
- `@shared-optimistic`
- `@shared-message-handler`
- `@shared-utils`

Disallowed examples:

- `@shared-domain/orders/order`
- `@shared-api/http/createApiClient`
- relative imports into another app

## Shared Package Rules

Shared packages must remain framework-agnostic and app-independent.

Shared packages must not import:

- React
- Zustand
- TanStack Query
- app hooks
- app session or storage modules
- UI components
- feature providers

Shared packages may contain:

- pure domain contracts
- pure mappers
- validation logic
- transport-safe API wrappers
- deterministic utilities

Exception:

- `@shared-store` is an allowed shared runtime utility package for cross-app store factories built on Zustand
- `@shared-store` must remain app-independent and must not import app code, feature code, or React UI
- `@shared-message-handler` is an allowed shared React UI/runtime package for cross-app transient notification handling
- `@shared-message-handler` must remain app-independent and must not import app or feature code

Utilities in shared packages must be pure:

- no side effects
- no global state
- no session/store dependencies
- behavior must depend only on function arguments

## Data Flow Rule

Frontend code should follow this dependency direction:

`packages -> app/services -> features/api -> features/actions -> features/flows -> features/controllers -> pages/components`

Additional rules:

- lower layers must not import higher layers
- components and pages must not reach directly into `app/services`
- actions should consume feature `api/` when the feature owns a backend contract
- flows may compose actions
- controllers may compose flows and actions
- providers may wire scope and dependencies, but must not become alternate flow layers

If a proposed change breaks this direction, redesign the placement before implementation.

## App Service Responsibilities

The `app/services` layer owns runtime infrastructure dependencies.

Services may include:

- API clients
- HTTP transport configuration
- session adapters
- authentication adapters
- storage adapters
- caching adapters
- environment configuration adapters

Features must not instantiate API clients, storage adapters, or transport layers directly.

Actions may depend on app services, but must not create new service instances.

## State Ownership Rules

State must have a clear owner.

### Shared/package state

`packages/` must not own app runtime state.

### App state

`app/` owns:

- session/auth state
- app bootstrap state
- app-wide connectivity or environment state
- app-level dependency wiring

### Feature state

`features/` own:

- feature-scoped UI state
- feature-scoped async state
- feature-local workflow state

Feature state must not leak into unrelated features.

If feature runtime state must be shared across multiple controllers or components, it belongs in a feature `stores/` layer.

### Server state

Server-loaded state must be accessed through actions/flows/controllers, not directly inside components.

### Form state

Form state belongs to the feature controller or a feature-local form provider, not the page component.

If the same state is being managed in more than one layer, stop and define a single owner before proceeding.

## Feature Configuration Rule

Features must not read environment variables or global configuration directly.

Environment and runtime configuration must be accessed through app-level services or app-level dependency wiring.

Examples:

- API base URLs
- environment flags
- workspace configuration
- capability flags

This keeps features portable and testable.

## Feature Folder Contract

Each feature should be organized with these folders when applicable:

- `domain/`
- `api/`
- `actions/`
- `flows/`
- `controllers/`
- `stores/`
- `providers/`
- `components/`
- `pages/`

Do not collapse these responsibilities into one file just because the feature is small. If a feature is still small, keep the same responsibility boundaries with fewer files.

## Layer Responsibilities

### `domain/`

Feature-local language only:

- types
- rules
- guards
- mappers
- derived selectors
- view-model builders

`domain/` must not contain transport code, React components, or page orchestration.

### `api/`

Feature API modules own feature-scoped backend contracts.

Use `api/` for:

- feature-specific endpoint wrappers
- feature-specific request and response contracts
- backend-to-feature DTO mappers when they are specific to that feature
- thin adapters over `app/services` transport or shared API clients

`api/` may depend on:

- `app/services`
- `packages`
- feature `domain/`

`api/` must not contain:

- UI logic
- React components
- multi-step workflow orchestration
- store mutations

If a backend integration is specific to one feature, it belongs in that feature's `api/`.

If the integration is app-wide infrastructure or shared across multiple features, it belongs in `app/services` or `packages`, not feature `api/`.

### `actions/`

Single operations only:

- one intent per file
- one business operation per action
- may call feature `api/`, app services, or shared API modules

`actions/` must not contain page layout logic or multi-step orchestration.

Actions must clearly represent either a query or a mutation.

Query actions:

- read server data
- must not mutate server or client state
- must not trigger business side effects
- may validate or map returned data

Mutation actions:

- represent one state-changing operation
- may trigger side effects such as invalidation or workflow continuation
- must represent a single business intent

Do not combine read and write behavior in the same action.

### `flows/`

Use `flows/` for orchestration:

- sequences across multiple actions
- workspace resets
- revalidation
- sync coordination
- optimistic/retry orchestration

`flows/` may compose actions, but should not render UI.

Flows are allowed to update feature stores.

Long-running or persistent async processes belong in:

- app providers
- feature providers
- dedicated flows

Examples:

- polling
- websocket subscriptions
- background synchronization
- push message listeners

Components may subscribe to the resulting state, but must not own these processes.

### `controllers/`

Controllers adapt feature logic to UI:

- UI-facing hooks
- event handlers for pages/components
- state shaping for rendering
- normalized view model exposure

Controllers may use actions and flows, but must not talk directly to storage or create transport clients.

Controllers must not trigger side effects during render.

Controllers should read shared feature state through stores and selectors instead of rebuilding duplicated shared state with local `useState`.

### `stores/`

Feature state containers live in `stores/`.

The `stores/` layer owns feature-scoped runtime state and state access helpers.

Typical contents:

- store definitions
- state mutations
- selectors
- derived state helpers

Examples:

- `orders.store.ts`
- `orders.selectors.ts`
- `orders.mutations.ts`

Stores are the single source of truth for feature runtime state.

Feature state must not be duplicated across:

- controllers
- providers
- pages
- components

Stores must not:

- call APIs
- call app services
- perform multi-step workflows
- contain UI rendering logic
- depend on React components

Stores may depend on:

- feature `domain/` types
- pure utilities
- pure mappers

Store updates must originate from:

- flows
- controllers invoking store mutations

Stores must not orchestrate workflows themselves.

### Store Selectors

Selectors expose derived or filtered state from the store.

Selectors must be:

- pure
- deterministic
- independent from UI components

Selectors should live in the store file or a neighboring `*.selectors.ts` file.

Selectors must not:

- trigger side effects
- call APIs
- mutate store state

### Store Mutations

Store mutations represent controlled state updates.

Mutations should:

- update one slice of state
- represent a clear intent

Examples:

- `setOrders`
- `addOrder`
- `removeStop`
- `updateDriverStatus`

Avoid generic names such as:

- `update`
- `modify`
- `changeData`

### `providers/`

Providers are feature shells only:

- expose feature-scoped context
- wire feature scope/dependencies
- hold minimal scoped state when necessary

Providers must not become the main home of business orchestration.

### `components/`

Components are presentational:

- render UI
- receive props
- emit callbacks

Components must not call APIs directly or own multi-step business processes.

Components must not directly trigger side effects other than invoking controller callbacks.

### `pages/`

Pages are route-level composition only:

- compose providers, controllers, and components
- define page structure
- connect route params to feature entrypoints

Pages must not own transport code or feature orchestration.

## View Model Rule

Pages and components must not depend directly on raw backend response shapes when a feature-specific UI contract is needed.

Use controllers and domain mappers to expose normalized view models such as:

- `AssignedRouteViewModel`
- `OrderListItemViewModel`
- `LoginFormState`

Rules:

- backend DTOs are not page contracts
- controllers should expose rendering-safe shapes
- formatting and derived flags should be computed before reaching presentational components

If a component needs to know backend field names to render correctly, the boundary is likely wrong.

## Async State Contract

Every async feature must define explicit UI-facing async states.

At minimum, evaluate whether the feature needs:

- `idle`
- `loading`
- `success` or `ready`
- `empty`
- `retryable_failure`
- `terminal_failure`
- `stale` or `offline`

These states should be represented in the controller or feature state contract, not improvised ad hoc in components.

Errors must be classified intentionally:

- retryable errors
- terminal errors
- authorization/session errors

Do not reduce all failures to a single generic error flag when the feature behavior differs by failure type.

## Form Contract

Forms must be structured with explicit separation:

- draft type or form contract in `domain/` when needed
- validation boundary
- submit action
- controller managing field state and submission state
- presentational form component

Pages must not directly manage complex form state, submission logic, and layout in the same file.

Quick-entry forms may be simpler, but they must still preserve responsibility boundaries.

## Feature Public API Boundary

Each feature must expose a public barrel file defining its public interface.

Example:

- `features/orders/index.ts`

Consumers must import from the feature root only.

Allowed:

- `features/orders`

Disallowed:

- `features/orders/domain/...`
- `features/orders/actions/...`
- `features/orders/controllers/...`
- `features/orders/providers/...`

If another part of the app needs something from a feature, it must be intentionally exported through the feature barrel.

Internal feature folders are implementation details and must not leak across the app.

## Store Interaction Rule

Layer interaction involving feature runtime state should follow this direction:

`actions -> stores -> flows -> controllers -> components`

Typical flow:

1. an action loads or mutates server data
2. a flow coordinates the operation
3. the flow updates the store
4. controllers read state through selectors
5. components render based on controller output

Controllers must not reimplement shared feature state using `useState`.

Feature runtime state should live in stores whenever it must be accessed by multiple controllers or components.

## Store Access Rule

Stores are the single source of truth for feature runtime state.

Controllers may read store state and invoke store mutations, but must not orchestrate complex multi-step state updates.

Complex state coordination must happen inside flows.

Example pattern:

1. an action retrieves or mutates server data
2. a flow coordinates the operation
3. the flow updates one or more stores
4. controllers read state through selectors
5. components render based on controller output

Controllers must not implement multi-step mutation sequences that coordinate multiple stores.

If a UI event requires multiple state updates or cross-feature coordination, the logic belongs in a flow.

## Store Placement

Feature stores must live inside the feature:

- `features/<feature>/stores/`

Do not place feature stores in:

- `app/`
- `packages/`
- other features

Shared packages must remain pure and must not contain runtime state containers.

App-level state such as session, auth, and environment belongs in `app/`, not feature stores.

## DTO Mapping Rule

Transport DTOs must not enter feature state directly.

All server responses must be mapped to domain or feature-specific types before entering stores.

Correct flow:

`API DTO -> mapper -> domain or feature type -> store`

Incorrect flow:

`API DTO -> store`

DTO mapping should occur in:

- actions
- shared API modules
- dedicated mappers inside `domain/`

This keeps backend schema changes from leaking directly into UI state contracts.

## Feature Initialization Rule

Features that require coordinated data loading must use a dedicated initialization flow.

Pages and providers must not implement large initialization logic directly.

Initialization flows should orchestrate:

- initial queries
- store hydration
- workspace setup
- feature resets when needed

Example file names:

- `initializeOrdersWorkspace.flow.ts`
- `initializeRouteWorkspace.flow.ts`
- `initializeDriverSession.flow.ts`

Pages should delegate initialization to these flows instead of performing data loading directly.

## Store Granularity Rule

Stores must represent cohesive feature state boundaries.

Avoid large stores that manage unrelated entities or workflows.

Good examples:

- `orders.store.ts`
- `routeStops.store.ts`
- `driverLocation.store.ts`

Avoid generic stores such as:

- `app.store.ts`
- `global.store.ts`
- `data.store.ts`

If a store begins managing multiple unrelated concepts, split it into smaller feature-aligned stores.

## Naming Rules

Use consistent names so responsibility is visible from the file name.

Recommended patterns:

- controllers: `useXController`, `useXController.controller.ts`
- actions: `createX.action.ts`, `updateX.action.ts`, `deleteX.action.ts`, `submitX.action.ts`
- queries: `loadX.query.ts`, `getX.query.ts`
- flows: `useXFlow`, `runXFlow`, `x.flow.ts`
- providers: `XProvider`, `XShellProvider`
- mappers: `mapXToY`
- guards/rules: `canX`, `shouldX`, `isX`
- UI contracts: `XViewModel`
- mutation contracts: `XCommand`, `XResult`
- drafts/forms: `XDraft`, `XFormState`

Avoid vague names such as:

- `helpers`
- `utils` inside feature folders when the logic has a real domain meaning
- `logic`
- `handlers`
- `manager` unless it truly manages a bounded subsystem

If a file name does not communicate its responsibility clearly, rename it.

## Dependency Injection Rule

Features must not instantiate API clients, storage adapters, or app services directly.

Allowed:

- app layer creates clients/services
- providers wire dependencies
- actions receive or import approved app-level services

Forbidden:

- components creating clients
- controllers creating clients
- feature files creating alternate app singletons

There must be one clear app-owned source for runtime dependencies.

## Side Effect Boundary Rule

Side effects must originate from actions or flows.

Examples:

- API mutations
- event dispatch
- navigation
- cache invalidation
- background synchronization

Controllers must not trigger side effects during render.

Components must not trigger side effects directly except through controller callbacks.

Single-operation side effects belong in actions.

Multi-step side-effect orchestration belongs in flows.

## Diagnostics Rule

Diagnostic logging and operational instrumentation should occur inside actions or flows.

Controllers and components must not contain diagnostic logging for feature workflows.

Logging may be used for:

- API operation tracing
- workflow debugging
- retry orchestration visibility

Keeping diagnostics in actions and flows prevents UI layers from accumulating operational logic.

## Cross-Feature Dependency Rule

Features must remain loosely coupled.

Rules:

- prefer `packages/` for cross-app stable logic
- prefer app-level composition over direct feature-to-feature imports
- one feature must not reach into another feature's internal folders

If one feature needs another feature's internal controller, provider, or action, that boundary is probably wrong.

Allowed direct feature imports should be rare and intentional.

Feature-to-feature consumption must happen through the exported feature barrel, not internal folders.

## Placement Decision Rule

Before creating or modifying a frontend file, evaluate the change with this order:

1. Is this cross-app stable logic?
   If yes, it belongs in `packages/`.
2. Is this feature-local language or rules?
   If yes, it belongs in `domain/`.
3. Is this one executable operation?
   If yes, it belongs in `actions/`.
4. Is this a multi-step use case?
   If yes, it belongs in `flows/`.
5. Is this UI-facing adaptation logic?
   If yes, it belongs in `controllers/`.
6. Is this feature scope/context wiring?
   If yes, it belongs in `providers/`.
7. Is this rendering only?
   If yes, it belongs in `components/` or `pages/`.

If a file answers yes to more than one of the categories above, split the file.

## Refactor and Deletion Rule

When logic is moved to the correct layer, remove or reduce the old source of truth in the same change whenever it is safe to do so.

Do not leave behind duplicated implementations unless there is a deliberate short-lived migration step.

Temporary duplication must be:

- intentional
- short-lived
- clearly identified for follow-up removal

## Forbidden Patterns

The following are not allowed:

- page components containing business orchestration
- providers containing multi-step feature logic
- components calling APIs or services directly
- controllers creating API clients
- controllers reading app storage directly
- actions mutating unrelated feature state
- combined read/write behavior in the same action file
- components owning polling, websocket, or background sync processes
- feature code reading environment variables directly
- shared feature state duplicated across stores, controllers, providers, or pages
- stores calling APIs or app services directly
- stores orchestrating multi-step workflows
- raw transport DTOs being written into feature stores
- pages or providers containing large feature initialization sequences
- controllers coordinating multi-step store updates across multiple stores
- controllers or components holding workflow diagnostics/logging
- pages managing complex form state and submission logic inline
- raw backend DTOs flowing directly into presentational components when a view model is needed
- feature state duplicated across app, page, and controller layers
- feature code importing package internals
- one app importing another app's code

## Driver App Specific Rule

For `driver-app`, treat `team-driver` and `independent-driver` as separate workspaces, not as filtered views over shared in-memory state.

- workspace-bound state must be scoped by workspace key
- mode switch must be treated as a workspace reset
- capability checks must come from derived contracts, not scattered raw role checks

## Testing Expectations

Architecture is not complete unless the layer can be tested at the right level.

Expected test focus:

- `domain/`: unit tests for rules, mappers, selectors, guards
- `actions/`: operation tests around service interaction and result mapping
- `flows/`: orchestration tests
- `controllers/`: hook/controller state tests
- `components/`: rendering and interaction tests
- `pages/`: route-level composition tests where needed

Not every file requires a test immediately, but new architecture should be written so each layer is testable in isolation.

## Review Standard

When implementing or reviewing frontend changes:

- check responsibility placement before code style
- reject mixed-responsibility files
- prefer adding a new correctly-scoped file over expanding a convenient but overloaded file
