# Route Operations Plan Refactor Intent

Date: 2026-03-26
Archived on: 2026-03-27 12:39:37 CET

## Purpose

This document explains the intended refactor of `admin-app/src/features/plan` for the next agent.

It is not a low-level migration checklist like `ROUTE_PLAN_MIGRATION_HANDOFF.md`.
Its purpose is to explain:

- what the `plan` feature originally was
- why it was built that way
- why that model no longer fits the backend and workspace direction
- what `plan` should become after the refactor
- what architectural guardrails should be preserved during the change

## Short Version

The old frontend `plan` feature was built around a single parent delivery-plan concept that owned multiple plan types.

That assumption is no longer true.

The backend has moved to a model where plan types are first-class features with their own stores and lifecycles. They are no longer children of one major plan entity that groups them together.

The frontend has already started to reflect that shift through separate home workspace features:

- `features/home-app`
- `features/home-route-operations`
- `features/home-international-shipping`
- `features/home-store-pickup`

The `features/plan` feature must now be narrowed and cleaned so it represents only the route-operations plan feature, not a cross-plan-type umbrella.

## What The Old `plan` Feature Was

Originally, `features/plan` acted as the shared plan orchestration layer for multiple plan types:

- local delivery
- international shipping
- store pickup

It owned:

- the main plan store
- plan list and pagination
- plan state registry
- shared plan UI
- plan DnD behaviors
- plan popups and creation flow
- plan-type lookup and plan-type fetch logic
- nested `planTypes/*` implementations under the same feature tree

This made sense at the time because the backend model implied:

- there is one major plan entity
- that plan has a `plan_type`
- the specialized behavior hangs off that parent plan
- the frontend can route most behavior through the parent plan store first

In other words, `plan` was built as a hub because the data model was hub-shaped.

## Why It Was Built That Way

The old architecture was reasonable for the previous backend contract.

The parent delivery plan was the stable entrypoint for:

- list queries
- selection
- DnD assignment targets
- totals
- plan states
- fetching specialized plan-type data
- rendering a generic plan card before resolving the specialized workspace

That led naturally to:

- one generic plan store
- one plan page shell
- nested plan-type folders inside `features/plan/planTypes`
- one registry-driven system for plan-type specialization

This was not accidental technical debt.
It was a coherent response to the earlier backend truth.

## Why It No Longer Fits

The backend has changed the ownership model.

Plan types are now first-class features. They are independent. They should not be treated as subordinate branches under one major plan container.

That means the old frontend shape now creates the wrong pressure:

- `features/plan` still sounds generic even though it should now be route-operations-specific
- `planTypes/*` nested under `features/plan` suggests these workspaces are subtypes of route operations
- cross-workspace assumptions remain embedded in store access and naming
- the feature boundary encourages code to flow through a generic parent store even where the product model is now workspace-first

The main mismatch is conceptual:

- old shape: one plan feature with specialized plan types beneath it
- new shape: multiple workspace features, each first-class, with route operations being only one of them

## What Has Already Started

The frontend has already started moving toward the new model.

Current direction already visible in the repo:

- `home-app` owns the shared header and cross-workspace UI that survives workspace switches
- `home-route-operations` is the route-operations workspace shell
- `home-international-shipping` is the international-shipping workspace shell
- `home-store-pickup` is the store-pickup workspace shell
- independent feature trees such as `local-delivery-orders` already exist outside `features/plan/planTypes/*`

Also, the plan store layer has already been renamed toward RoutePlan naming:

- RoutePlan symbols are now in place
- store filenames have already been migrated to RoutePlan names

That rename was not the end goal.
It was a preparatory step that makes the remaining refactor less semantically confused.

## What `features/plan` Should Become

`features/plan` should become the route-operations plan feature.

That means:

- it is no longer the umbrella for all plan types
- it is no longer the conceptual owner of international shipping or store pickup behavior
- it should describe route-operations plan behavior explicitly
- its naming, UI copy, store usage, and internal abstractions should stop implying product-wide plan ownership

In practical terms, after refactor, `features/plan` should mean:

- route-operations plan list
- route-operations plan creation/edit/delete flows
- route-operations plan DnD interactions
- route-operations-specific shared plan UI
- route-operations plan state and pagination

It should not mean:

- the generic home for all workspace plan types
- the umbrella registry for unrelated workspace features
- the permanent container for `planTypes/internationalShipping` and `planTypes/storePickup`

## Target Architecture Direction

The target direction is workspace-first, not generic-parent-plan-first.

The intended high-level shape is:

- `home-app` for persistent cross-workspace shell concerns
- one home feature per workspace
- one first-class feature tree per workspace domain
- route operations remains a workspace with its own plan feature

The route-operations workspace may still use a route-plan entity, but that entity should not imply it owns the other workspaces.

## Refactor Intent For The Next Agent

The next refactor should focus on semantics, ownership, and boundaries, not just renaming strings.

Main intent:

1. Make `features/plan` clearly route-operations-only.
2. Remove or reduce wording that implies all plan types live under one parent plan feature.
3. Untangle dependencies that still treat international shipping or store pickup as subordinate plan subtypes under `features/plan`.
4. Preserve working behavior while moving toward clearer workspace boundaries.

## Expected Kinds Of Changes

The next pass will likely include some combination of:

- naming cleanup inside `features/plan`
- label cleanup in UI text and comments
- registry cleanup where old generic plan-type assumptions remain
- boundary cleanup between `features/plan` and workspace-specific feature trees
- reducing reliance on nested `features/plan/planTypes/*`
- moving logic to independent workspace features where ownership is clearer

The exact sequence can vary, but the direction should stay the same:

- generic umbrella behavior decreases
- route-operations-specific behavior stays in `features/plan`
- unrelated workspace behavior moves out or becomes explicitly external

## What Should Stay True During Refactor

Even while refactoring, preserve these principles:

- do not reintroduce compatibility aliases just to keep old semantics alive
- do not expand `features/plan` back into a cross-workspace umbrella
- do not collapse workspace-specific logic into generic files for convenience
- keep store ownership explicit
- keep route-operations behavior compiling and working while boundaries are being cleaned

## What This Refactor Is Not

This refactor is not:

- a pure search-and-replace naming pass
- a full backend/domain rename of every `DeliveryPlan` type immediately
- a mandate to delete all duplicated structures in one risky sweep
- a reason to hide unclear ownership behind temporary generic helpers

The goal is to make the frontend match the new product and backend truth, not merely to make names prettier.

## Recommended Mental Model

When touching `features/plan`, the next agent should think:

"This is the route-operations plan feature inside the route-operations workspace."

Not:

"This is the generic plan root for every workspace."

That distinction should guide:

- file naming
- labels
- feature exports
- registry ownership
- future moves out of `planTypes/*`

## Suggested Outcome

A successful refactor should leave the codebase in a state where:

- `features/plan` is clearly understood as route-operations-only
- workspace separation is easier to see from the folder structure and naming
- future extraction of remaining nested plan-type logic is easier
- the old parent-plan mental model is no longer reinforced by the frontend architecture

## Related Docs

- `admin-app/docs/ROUTE_PLAN_MIGRATION_HANDOFF.md`
- `admin-app/src/features/plan/store/ROUTE_PLAN_STORE_RENAME_MAP.md`
