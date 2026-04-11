# Create Route Group Form — Implementation Plan

## Goal

Add a "+" button to the `RouteGroupRail` that opens a popup form for creating a new route group within the active plan. The form has two fields: a route group name and a single-zone selector. When no zone is selected the request includes route group solution defaults (same as plan creation). The creation follows the established optimistic transaction pattern.

---

## Architecture Overview

```
RouteGroupRail (+ button)
  → popupManager.open({ key: 'CreateRouteGroupForm', payload: { planId } })
    → CreateRouteGroupFormPopup
      → CreateRouteGroupFormFeature (provider + setters)
        → CreateRouteGroupFormFields (name input + ZoneSingleSelector)
        → CreateRouteGroupFormFooter (submit button)
  → on submit:
    → buildRouteGroupPlanTypeDefaults (if zone_id === null)
    → routeGroupApi.createRouteGroup(planId, payload)
    → optimistic insert → upsert on success / rollback on error
```

---

## Step 1 — Extend `routeGroupApi` with `createRouteGroup`

**File:** `src/features/plan/routeGroup/api/routeGroup.api.ts`

Add a new type and API method:

```ts
export type CreateRouteGroupPayload = {
  name: string;
  zone_id: number | null;
  route_group_defaults?: {
    route_solution?: RouteGroupSolutionDefaults; // same shape as plan_type_defaults.route_group_defaults.route_solution
  };
};

// Add to routeGroupApi object:
createRouteGroup: (
  planId: number,
  payload: CreateRouteGroupPayload,
): Promise<ApiResult<RouteGroup>> =>
  apiClient.request<RouteGroup>({
    path: `/api_v2/route_plans/${planId}/route-groups`,
    method: 'POST',
    data: payload,
  }),
```

`RouteGroupSolutionDefaults` — import the same type already defined under `src/features/plan/types/plan.ts` (`RouteGroupDefaults['route_solution']`). If that type is not yet exported, export it.

---

## Step 2 — New form type definitions

**New file:** `src/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm.types.ts`

```ts
export type CreateRouteGroupFormState = {
  name: string;
  zone_id: number | null;
};

export type CreateRouteGroupFormPopupPayload = {
  planId: number;
};
```

---

## Step 3 — Validation hook

**New file:** `src/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm.validation.ts`

Pattern mirrors `PlanForm.validation.ts`.

```ts
import type { CreateRouteGroupFormState } from './CreateRouteGroupForm.types';

export type CreateRouteGroupFormErrors = {
  name?: string;
};

export const useCreateRouteGroupFormValidation = (
  state: CreateRouteGroupFormState,
): CreateRouteGroupFormErrors => {
  const errors: CreateRouteGroupFormErrors = {};
  if (!state.name.trim()) {
    errors.name = 'Route group name is required';
  }
  return errors;
};

export const hasCreateRouteGroupFormErrors = (
  errors: CreateRouteGroupFormErrors,
): boolean => Object.keys(errors).length > 0;
```

---

## Step 4 — Form setters

**New file:** `src/features/plan/routeGroup/forms/createRouteGroupForm/createRouteGroupForm.setters.ts`

```ts
import type { Dispatch, SetStateAction } from 'react';
import type { CreateRouteGroupFormState } from './CreateRouteGroupForm.types';

type Props = {
  setState: Dispatch<SetStateAction<CreateRouteGroupFormState>>;
};

export const createRouteGroupFormSetters = ({ setState }: Props) => ({
  setName: (name: string) =>
    setState((prev) => ({ ...prev, name })),

  setZoneId: (zone_id: number | null) =>
    setState((prev) => ({ ...prev, zone_id })),
});
```

---

## Step 5 — Form provider and context

**New file:** `src/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm.provider.tsx`

```ts
import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type {
  CreateRouteGroupFormState,
  CreateRouteGroupFormPopupPayload,
} from './CreateRouteGroupForm.types';
import { createRouteGroupFormSetters } from './createRouteGroupForm.setters';
import {
  useCreateRouteGroupFormValidation,
  hasCreateRouteGroupFormErrors,
} from './CreateRouteGroupForm.validation';

type CreateRouteGroupFormContextValue = {
  state: CreateRouteGroupFormState;
  setters: ReturnType<typeof createRouteGroupFormSetters>;
  errors: ReturnType<typeof useCreateRouteGroupFormValidation>;
  isValid: boolean;
  planId: number;
};

const CreateRouteGroupFormContext = createContext<
  CreateRouteGroupFormContextValue | undefined
>(undefined);

export const useCreateRouteGroupFormContext = () => {
  const ctx = useContext(CreateRouteGroupFormContext);
  if (!ctx) throw new Error('useCreateRouteGroupFormContext: missing provider');
  return ctx;
};

type Props = {
  payload: CreateRouteGroupFormPopupPayload;
  children: ReactNode;
};

export const CreateRouteGroupFormProvider = ({ payload, children }: Props) => {
  const [state, setState] = useState<CreateRouteGroupFormState>({
    name: '',
    zone_id: null,
  });

  const setters = useMemo(
    () => createRouteGroupFormSetters({ setState }),
    [],
  );

  const errors = useCreateRouteGroupFormValidation(state);
  const isValid = !hasCreateRouteGroupFormErrors(errors);

  const value = useMemo<CreateRouteGroupFormContextValue>(
    () => ({ state, setters, errors, isValid, planId: payload.planId }),
    [state, setters, errors, isValid, payload.planId],
  );

  return (
    <CreateRouteGroupFormContext.Provider value={value}>
      {children}
    </CreateRouteGroupFormContext.Provider>
  );
};
```

**When a zone is selected:** derive the route group name automatically from the zone's `name` field (looked up from the zone store). The `setZoneId` setter also calls `setName(zoneName)` when a zone is picked, and clears name when zone is deselected.

Update `setZoneId` in setters to accept an optional `zoneName`:

```ts
setZoneId: (zone_id: number | null, zoneName?: string | null) =>
  setState((prev) => ({
    ...prev,
    zone_id,
    name: zone_id !== null && zoneName ? zoneName : prev.name,
  })),
```

---

## Step 6 — Zone single-selector component

**New file:** `src/features/plan/routeGroup/forms/createRouteGroupForm/components/CreateRouteGroupFormZoneSelector.tsx`

- Reads available zones from `useZoneStore` (the active version's zones list).
- Renders a scrollable list of radio-button items (one zone at a time, or "No Zone" as an implicit default when nothing selected).
- A zone item that is already assigned to another route group in the same plan is visually disabled with a tooltip ("Already assigned to [group name]"). To derive this, accept `usedZoneIds: Set<number>` from the parent context.
- On select, calls `setters.setZoneId(zone.id, zone.name)`.
- On deselect (clicking selected zone again, or a "Clear" action), calls `setters.setZoneId(null)`.

The `usedZoneIds` set is derived from the current route groups of this plan: `new Set(routeGroups.filter(rg => rg.zone_id != null).map(rg => rg.zone_id!))`.

Read these from the provider via `useRouteGroupPageState()` (the `RouteGroupPageStateContext` is accessible because the popup is rendered inside `RouteGroupPageProvider`).

---

## Step 7 — Form fields and footer components

**New file:** `src/features/plan/routeGroup/forms/createRouteGroupForm/components/CreateRouteGroupFormFields.tsx`

Renders:
1. **Name field** — text input bound to `state.name` / `setters.setName`. Shows `errors.name` inline.
2. **Zone selector** — `<CreateRouteGroupFormZoneSelector />`.

**New file:** `src/features/plan/routeGroup/forms/createRouteGroupForm/components/CreateRouteGroupFormFooter.tsx`

Renders a "Create Route Group" submit button. Disabled when `!isValid` or `isSubmitting`. Calls `onSubmit()` from props.

---

## Step 8 — Feature root (form shell)

**New file:** `src/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm.tsx`

```tsx
import { CreateRouteGroupFormProvider } from './CreateRouteGroupForm.provider';
import type { CreateRouteGroupFormPopupPayload } from './CreateRouteGroupForm.types';

type Props = {
  payload: CreateRouteGroupFormPopupPayload;
  onSuccessClose: () => void;
  children: ReactNode;
};

export const CreateRouteGroupFormFeature = ({
  payload,
  onSuccessClose,
  children,
}: Props) => (
  <CreateRouteGroupFormProvider payload={payload}>
    {children}
  </CreateRouteGroupFormProvider>
);
```

The submit logic lives in the popup layer (step 9) where it has access to the submit action.

---

## Step 9 — Create route group action (controller)

**New file:** `src/features/plan/routeGroup/controllers/createRouteGroup.controller.ts`

This controller owns the submit logic: build payload → optimistic insert → API → upsert/rollback.

```ts
import { v4 as uuidv4 } from 'uuid';
import { routeGroupApi } from '../api/routeGroup.api';
import { useRouteGroupStore } from '../store/routeGroup.slice';
import { buildRouteGroupPlanTypeDefaults } from '../domain/planTypeDefaults/routeGroupDefaults.generator';
import { useMessageHandler } from '@shared-message-handler';
import type { CreateRouteGroupFormState } from '../forms/createRouteGroupForm/CreateRouteGroupForm.types';

export const useCreateRouteGroupController = () => {
  const { upsertRouteGroup, removeRouteGroupByClientId } = useRouteGroupStore();
  const { showMessage } = useMessageHandler();

  const createRouteGroup = async (
    planId: number,
    state: CreateRouteGroupFormState,
  ): Promise<boolean> => {
    const clientId = uuidv4();

    // Build optimistic entry
    const optimisticRouteGroup = {
      client_id: clientId,
      route_plan_id: planId,
      zone_id: state.zone_id,
      zone_snapshot: state.zone_id ? { name: state.name } : null,
      total_orders: 0,
    };

    // Optimistic insert
    upsertRouteGroup(optimisticRouteGroup);

    try {
      // Resolve defaults when no zone selected
      let route_group_defaults: CreateRouteGroupPayload['route_group_defaults'];
      if (state.zone_id === null) {
        const defaults = await buildRouteGroupPlanTypeDefaults({
          getCurrentLocationAddress: async () => null,
        });
        route_group_defaults = defaults?.route_group_defaults ?? undefined;
      }

      const result = await routeGroupApi.createRouteGroup(planId, {
        name: state.name,
        zone_id: state.zone_id,
        route_group_defaults,
      });

      if (!result.ok || !result.data) {
        throw new Error(result.error ?? 'Create route group failed');
      }

      // Replace optimistic entry with server response
      upsertRouteGroup({ ...result.data, client_id: clientId });
      return true;
    } catch {
      // Rollback
      removeRouteGroupByClientId(clientId);
      showMessage({
        status: 'error',
        message: 'Failed to create route group.',
      });
      return false;
    }
  };

  return { createRouteGroup };
};
```

**Store operations needed in `routeGroup.slice.ts`:**
- `upsertRouteGroup(routeGroup: RouteGroup)` — already likely exists; confirm it handles `client_id`-keyed upsert.
- `removeRouteGroupByClientId(clientId: string)` — add if missing.

---

## Step 10 — Popup entry point and popup shell

**New file:** `src/features/plan/routeGroup/popups/createRouteGroup/CreateRouteGroupForm.tsx`

Entry point matching the registry pattern:

```tsx
import type { StackComponentProps } from '@/shared/stack-manager/types';
import type { CreateRouteGroupFormPopupPayload } from '@/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm.types';
import { CreateRouteGroupFormPopup } from './CreateRouteGroupFormPopup';

export const CreateRouteGroupForm = ({
  payload,
  onClose,
}: StackComponentProps<CreateRouteGroupFormPopupPayload>) => (
  <CreateRouteGroupFormPopup payload={payload} onClose={onClose} />
);
```

**New file:** `src/features/plan/routeGroup/popups/createRouteGroup/CreateRouteGroupFormPopup.tsx`

```tsx
import { useState } from 'react';
import { FeaturePopupShell } from '@/shared/popups/featurePopup/FeaturePopupShell';
import { CreateRouteGroupFormFeature } from '../../forms/createRouteGroupForm/CreateRouteGroupForm';
import { CreateRouteGroupFormFields } from '../../forms/createRouteGroupForm/components/CreateRouteGroupFormFields';
import { CreateRouteGroupFormFooter } from '../../forms/createRouteGroupForm/components/CreateRouteGroupFormFooter';
import { useCreateRouteGroupFormContext } from '../../forms/createRouteGroupForm/CreateRouteGroupForm.provider';
import { useCreateRouteGroupController } from '../../controllers/createRouteGroup.controller';
import type { CreateRouteGroupFormPopupPayload } from '../../forms/createRouteGroupForm/CreateRouteGroupForm.types';
import type { StackComponentProps } from '@/shared/stack-manager/types';

const CreateRouteGroupFormContent = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const { state, isValid, planId } = useCreateRouteGroupFormContext();
  const { createRouteGroup } = useCreateRouteGroupController();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    const success = await createRouteGroup(planId, state);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <FeaturePopupShell
      size="sm"
      header={{ title: 'New Route Group' }}
      onRequestClose={onClose}
      footer={
        <CreateRouteGroupFormFooter
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isValid={isValid}
        />
      }
    >
      <CreateRouteGroupFormFields />
    </FeaturePopupShell>
  );
};

export const CreateRouteGroupFormPopup = ({
  payload,
  onClose,
}: StackComponentProps<CreateRouteGroupFormPopupPayload>) => (
  <CreateRouteGroupFormFeature payload={payload} onSuccessClose={onClose}>
    <CreateRouteGroupFormContent onClose={onClose} />
  </CreateRouteGroupFormFeature>
);
```

---

## Step 11 — Register popup in the plan popup registry

**File:** `src/features/plan/registry/planPopups.registry.ts`

```ts
import { PlanForm } from '../popups/PlanForm';
import { RouteGroupEditForm } from '../routeGroup/popups/editRouteGroup/RouteGroupEditForm';
import { CreateRouteGroupForm } from '../routeGroup/popups/createRouteGroup/CreateRouteGroupForm';

export const planPopupRegistry = {
  PlanForm: PlanForm,
  RouteGroupEditForm: RouteGroupEditForm,
  CreateRouteGroupForm: CreateRouteGroupForm,
};
```

---

## Step 12 — Add `handleAddRouteGroupClick` to `useRouteGroupPageActions`

**File:** `src/features/plan/routeGroup/actions/useRouteGroupPageActions.tsx`

Add to the `Props` type:
```ts
planId?: number | null;   // already present
```

Add the action:
```ts
const handleAddRouteGroupClick = () => {
  if (!planId) return;
  popupManager.open({
    key: 'CreateRouteGroupForm',
    payload: { planId },
  });
};
```

Add to the returned object:
```ts
return {
  // ...existing
  handleAddRouteGroupClick,
};
```

---

## Step 13 — Thread the action through shell controller and page

### `useRouteGroupsPageShellController`

**File:** `src/features/plan/routeGroup/controllers/useRouteGroupsPageShell.controller.ts`

```ts
import { useRouteGroupPageCommands } from '../context/useRouteGroupPageContext';

// Inside the hook:
const { routeGroupPageActions } = useRouteGroupPageCommands();

return {
  railItems,
  handleRouteGroupClick,
  handleAddRouteGroupClick: routeGroupPageActions.handleAddRouteGroupClick,
  // ...rest
};
```

### `RouteGroupsPageLayout` and `RouteGroupsPageScreen`

**File:** `src/features/plan/routeGroup/pages/RouteGroups.page.tsx`

Add `onAddRouteGroupClick: () => void` to `RouteGroupsPageLayoutProps` and thread it down to `RouteGroupRail`:

```tsx
<RouteGroupRail
  items={routeGroups}
  onClick={onRouteGroupClick}
  onAddClick={onAddRouteGroupClick}
/>
```

In `RouteGroupsPageScreen`, destructure `handleAddRouteGroupClick` from the shell controller and pass it:

```tsx
<RouteGroupsPageLayout
  // ...existing
  onAddRouteGroupClick={handleAddRouteGroupClick}
/>
```

Also add the "+" button to the `hasRouteGroups === false` empty state so the user can create the first route group without relying on zone materialization.

---

## Step 14 — Add "+" button to `RouteGroupRail`

**File:** `src/features/plan/routeGroup/components/routeGroupRail/RouteGroupRail.tsx`

```tsx
type RouteGroupRailProps = {
  items: RouteGroupRailItem[];
  onClick: (item: RouteGroupRailItem) => void;
  onAddClick?: () => void;
};

export const RouteGroupRail = ({ items, onClick, onAddClick }: RouteGroupRailProps) => {
  return (
    <aside className="min-h-0 h-full w-full md:w-[100px] md:min-w-[100px] md:max-w-[100px]">
      <div className="flex min-h-0 h-full flex-row gap-2 overflow-x-auto px-3 py-3 md:flex-col md:overflow-x-visible md:overflow-y-auto md:px-2">
        {items.map((item) => (
          <DroppableRouteGroupRailAvatar
            key={item.route_group_id}
            item={item}
            onClick={onClick}
          />
        ))}
        {onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            aria-label="Add route group"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-dashed border-white/30 text-white/50 transition hover:border-white/60 hover:text-white/80"
          >
            <span className="text-xl leading-none">+</span>
          </button>
        )}
      </div>
    </aside>
  );
};
```

The "+" button is rendered after all existing avatars. It uses a dashed-border circle style to visually distinguish it from the filled route group avatars. `onAddClick` is optional so the component remains backwards compatible.

---

## File Summary

### New files

| File | Purpose |
|------|---------|
| `src/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm.types.ts` | Form state + popup payload types |
| `src/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm.validation.ts` | Validation hook + error guard |
| `src/features/plan/routeGroup/forms/createRouteGroupForm/createRouteGroupForm.setters.ts` | State setters |
| `src/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm.provider.tsx` | Context provider |
| `src/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm.tsx` | Feature root wrapper |
| `src/features/plan/routeGroup/forms/createRouteGroupForm/components/CreateRouteGroupFormFields.tsx` | Name + zone selector fields |
| `src/features/plan/routeGroup/forms/createRouteGroupForm/components/CreateRouteGroupFormZoneSelector.tsx` | Single-zone radio selector |
| `src/features/plan/routeGroup/forms/createRouteGroupForm/components/CreateRouteGroupFormFooter.tsx` | Submit footer |
| `src/features/plan/routeGroup/popups/createRouteGroup/CreateRouteGroupForm.tsx` | Popup registry entry point |
| `src/features/plan/routeGroup/popups/createRouteGroup/CreateRouteGroupFormPopup.tsx` | Popup shell + submit orchestration |
| `src/features/plan/routeGroup/controllers/createRouteGroup.controller.ts` | Optimistic create + API call |

### Modified files

| File | Change |
|------|--------|
| `src/features/plan/routeGroup/api/routeGroup.api.ts` | Add `CreateRouteGroupPayload` type and `createRouteGroup` method |
| `src/features/plan/registry/planPopups.registry.ts` | Register `CreateRouteGroupForm` key |
| `src/features/plan/routeGroup/actions/useRouteGroupPageActions.tsx` | Add `handleAddRouteGroupClick` |
| `src/features/plan/routeGroup/controllers/useRouteGroupsPageShell.controller.ts` | Expose `handleAddRouteGroupClick` |
| `src/features/plan/routeGroup/pages/RouteGroups.page.tsx` | Thread `onAddRouteGroupClick` prop |
| `src/features/plan/routeGroup/components/routeGroupRail/RouteGroupRail.tsx` | Add optional `onAddClick` prop and "+" button |
| `src/features/plan/routeGroup/store/routeGroup.slice.ts` | Add `removeRouteGroupByClientId` if missing |

---

## Key Invariants

- **Zone uniqueness per plan**: The zone selector disables zones already assigned to another route group in the same plan. Derive `usedZoneIds` from `routeGroups` in the page state context.
- **Zone name = route group name**: When a zone is selected, the name field auto-fills from `zone.name`. When zone is cleared, name reverts to empty for user input.
- **No-zone defaults**: When `zone_id === null`, call `buildRouteGroupPlanTypeDefaults` before submitting and include `route_group_defaults` in the API payload. This is the same defaults object passed during plan creation per the `NO_ZONE_ROUTE_GROUP_DEFAULTS` plan.
- **Optimistic client_id**: The optimistic entry uses a UUID `client_id`. The server response must include the same `client_id` (or the frontend matches by replacing the entry keyed on `client_id` after upsert). Confirm the server echoes `client_id` — if not, upsert by `client_id` in the store must be done explicitly before the server assignment arrives.
- **Route group name source**: The `RouteGroup.zone_snapshot.name` field on existing groups is the display name shown in the rail (`zoneLabel`). The new group's name sent to the backend becomes its `zone_snapshot.name` for display. No separate name field exists; the name IS the zone snapshot name.
