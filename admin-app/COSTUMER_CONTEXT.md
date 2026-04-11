# Costumer Context Snapshot (Frontend)

## Date
- 2026-03-02

## Purpose
This file snapshots the implemented Costumer frontend feature scaffold so work can resume after unrelated UI/layout refactors.

## Implemented Scope
A new feature scaffold was added at:
- `src/features/costumer/`

### Files created
- DTO:
  - `src/features/costumer/dto/costumer.dto.ts`
- API:
  - `src/features/costumer/api/costumerApi.ts`
- Controller:
  - `src/features/costumer/controllers/costumer.controller.ts`
- Store modules:
  - `src/features/costumer/store/costumer.store.ts`
  - `src/features/costumer/store/costumer.selectors.ts`
  - `src/features/costumer/store/costumer.patchers.ts`
  - `src/features/costumer/store/costumer.upserters.ts`
  - `src/features/costumer/store/costumerList.store.ts`
- Feature exports:
  - `src/features/costumer/index.ts`

## Feature Architecture
Mirrors existing feature patterns (order/itemConfigurations):
- DTO contract module for domain and API response types.
- API client wrappers for list/get/create/update/delete.
- Entity store via `createEntityStore`.
- Separate selector / patcher / upserter modules.
- List meta store via `createListStore`.
- Controller orchestrates API calls and syncs store.

## API Contract Assumed by Frontend
- List: `GET /costumers/`
- Get: `GET /costumers/:id`
- Create: `POST /costumers/` with `{ fields: payload }`
- Update: `PUT /costumers/` with `{ target: payload }`
- Delete: `DELETE /costumers/` with `{ target_id | target_ids }`

## Controller Behavior
`useCostumerController()` exposes:
- `listCostumers(query?)`
- `getCostumer(costumerId)`
- `createCostumer(payload)`
- `updateCostumer(payload)`
- `deleteCostumer(payload)`
- `getCostumerFromStoreByClientId(clientId)`
- `getCostumerFromStoreByServerId(id)`

Store sync strategy:
- list/get normalize response to `CostumerMap` and upsert.
- create/update upsert each returned bundle `costumer`.
- delete resolves server IDs through `idIndex` and removes by `client_id`.

## Validation Performed
- Full frontend build passed:
  - `npm -C Front_end/delivery-app-front run build`

## Pending / Next Suggested Frontend Steps
1. Integrate costumer feature into UI flows/pages/forms.
2. Wire query store + list flow hook (similar to order flow) if needed.
3. Confirm backend has `GET /costumers/:id` before using detail call in UI.
4. Add tests for controller normalization and upsert/delete behavior.

## Resume Instruction
When resuming, load this file first and continue from "Pending / Next Suggested Frontend Steps".
