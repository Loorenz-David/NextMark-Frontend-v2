# AI Panel Backend Blocks Contract

Status: LOCKED (implementation baseline)
Contract version: 1
Owner: Frontend AI Panel package
Applies to: `POST /api_v2/ai/threads/:thread_id/messages` response payload

## Purpose

Define a strict backend response contract for structured assistant data rendering in the AI panel.

This contract introduces `message.blocks[]` so one assistant response can include multiple display blocks (for example one driver card plus an orders list), while preserving a migration path from legacy `message.data`.

## Scope

This file defines:
- Response shape for assistant messages
- Block model and allowed metadata
- Action ownership boundaries
- Migration policy from legacy payloads
- Validation and compatibility rules

This file does not define:
- Transport/auth envelope (`success`, `error`, etc.)
- Internal AI prompting strategy
- Frontend component implementation details

## Core Response Shape

Backend response `data` payload must include:

```json
{
  "thread_id": "thr_123",
  "message": {
    "role": "assistant",
    "content": "I found 14 orders for March assigned to this driver.",
    "status_label": "Completed",
    "blocks": [],
    "actions": [],
    "tool_trace": []
  }
}
```

## Message Field Rules

Required fields:
- `thread_id`: non-empty string
- `message.role`: `assistant` | `status` | `error`
- `message.content`: non-empty string

Optional fields:
- `message.status_label`: string
- `message.blocks`: `AiMessageBlock[]`
- `message.actions`: conversation actions (see ownership rules)
- `message.tool_trace`: structured tool trace entries
- `message.data`: legacy fallback during migration only

## Blocks Model

`message.blocks[]` is an ordered list. The frontend renders blocks in array order.

### Block Shape

```json
{
  "id": "blk_driver_1",
  "kind": "entity_detail",
  "entity_type": "driver",
  "layout": "card",
  "title": "Assigned driver",
  "subtitle": "Primary assignment",
  "data": {},
  "actions": [],
  "meta": {}
}
```

Required block fields:
- `kind`
- `data`

Recommended block fields:
- `id`
- `entity_type`
- `layout`
- `title`
- `subtitle`

Optional block fields:
- `actions`
- `meta`

### Allowed Enums

`kind`:
- `entity_detail`
- `entity_collection`
- `summary`
- `stat`
- `analytics_kpi`
- `analytics_trend`
- `analytics_breakdown`

`entity_type`:
- `order`
- `route`
- `plan`
- `client`
- `driver`
- `generic`
- `analytics`

`layout`:
- `card`
- `cards`
- `list`
- `table`
- `chips`
- `key_value`
- `metric_grid`
- `bar_list`

## Narrative Analytics Blocks

New block kinds for ordered analytics narrative responses (statistics capability):

### `analytics_kpi`
Single key performance indicator with optional change delta and confidence.

```json
{
  "kind": "analytics_kpi",
  "data": {
    "metric_name": "Delivery Completion Rate",
    "value": 96.5,
    "delta": 2.1,
    "unit": "%",
    "confidence_score": 0.92
  }
}
```

### `analytics_trend`
Temporal trend showing direction (up/down/stable) of a metric.

```json
{
  "kind": "analytics_trend",
  "data": {
    "title": "Route Efficiency",
    "description": "Average minutes per stop decreased from 8.2 to 7.9",
    "direction": "up",
    "confidence_score": 0.87,
    "data_points": []
  }
}
```

### `analytics_breakdown`
Distribution or composition analysis (e.g., percentages by category).

```json
{
  "kind": "analytics_breakdown",
  "data": {
    "title": "Delivery Status Distribution",
    "description": "Breakdown of order states across active plans",
    "components": [
      {"label": "Completed", "value": 847, "percentage": 67.8},
      {"label": "Preparing", "value": 312, "percentage": 24.9}
    ],
    "confidence_score": 0.95
  }
}
```

## Kind + Layout Compatibility

Recommended combinations:
- `entity_detail`: `card` | `key_value`
- `entity_collection`: `cards` | `list` | `table` | `chips`
- `summary`: `key_value` | `list`
- `stat`: `chips` | `key_value`
- `analytics_kpi`: `card` | `metric_grid`
- `analytics_trend`: `card` | `list`
- `analytics_breakdown`: `card` | `bar_list` | `table`

If backend sends a non-recommended pair, frontend may fallback to generic rendering.


## Actions Ownership

### Conversation actions (message level)

`message.actions[]` is reserved for AI conversation-driven next steps.

Examples:
- Apply an order filter inferred from the conversation
- Navigate to a workspace as suggested by the assistant

### Block actions (block level)

`block.actions[]` is optional and used for block-specific recommendations.

Examples:
- Open this route
- Copy this client phone

### Frontend local interactions

Card tap interactions owned by the app (for example opening an order detail panel) do not require backend actions and can be attached locally by frontend mapping.

## Migration Policy

### Phase A (compatibility mode)

Allowed:
- Backend sends `message.blocks[]`
- Backend may also send legacy `message.data`

Frontend behavior:
- Prefer `message.blocks[]`
- Fallback to legacy `message.data` only when `blocks` is absent or empty

### Phase B (cutover)

Required:
- Backend sends `message.blocks[]` for structured data

Deprecated:
- `message.data` removed from structured assistant payloads

## Backward Compatibility Rules

- Do not remove or rename enum values in contract version 1.
- Additive fields are allowed.
- Breaking field changes require a new `contract_version`.

## Validation Rules

- `thread_id` must be a non-empty string.
- `message.content` must always be present, even when blocks exist.
- Each block must include `kind` and `data`.
- For `entity_collection`, `data.items` should be an array.
- Unknown `kind`, `entity_type`, or `layout` values must not crash frontend rendering.

## Canonical Example A: Single Entity Detail

```json
{
  "thread_id": "thr_123",
  "message": {
    "role": "assistant",
    "content": "I found the assigned driver.",
    "status_label": "Completed",
    "blocks": [
      {
        "id": "blk_driver_1",
        "kind": "entity_detail",
        "entity_type": "driver",
        "layout": "card",
        "title": "Assigned driver",
        "data": {
          "id": "drv_42",
          "name": "Alex Carter",
          "phone": "+1 555 0102",
          "status": "active"
        }
      }
    ],
    "actions": []
  }
}
```

## Canonical Example B: Entity Collection

```json
{
  "thread_id": "thr_123",
  "message": {
    "role": "assistant",
    "content": "I found 14 orders for March.",
    "status_label": "Completed",
    "blocks": [
      {
        "id": "blk_orders_1",
        "kind": "entity_collection",
        "entity_type": "order",
        "layout": "cards",
        "title": "March orders",
        "data": {
          "items": [
            {
              "id": "ord_1",
              "order_number": "100245",
              "client_name": "Acme Foods",
              "status": "unscheduled"
            }
          ],
          "total": 14
        }
      }
    ],
    "actions": [
      {
        "type": "apply_order_filters",
        "label": "Apply March filters",
        "payload": {
          "mode": "replace",
          "filters": {
            "month": "march"
          }
        }
      }
    ]
  }
}
```

## Canonical Example C: Mixed Response (Driver + Orders)

```json
{
  "thread_id": "thr_123",
  "message": {
    "role": "assistant",
    "content": "These orders are assigned to one driver.",
    "status_label": "Completed",
    "blocks": [
      {
        "id": "blk_driver_1",
        "kind": "entity_detail",
        "entity_type": "driver",
        "layout": "card",
        "title": "Driver",
        "data": {
          "id": "drv_42",
          "name": "Alex Carter",
          "phone": "+1 555 0102"
        }
      },
      {
        "id": "blk_orders_1",
        "kind": "entity_collection",
        "entity_type": "order",
        "layout": "cards",
        "title": "Assigned orders",
        "data": {
          "items": [
            {
              "id": "ord_1",
              "order_number": "100245",
              "status": "scheduled"
            },
            {
              "id": "ord_2",
              "order_number": "100246",
              "status": "scheduled"
            }
          ],
          "total": 2
        }
      }
    ],
    "actions": [
      {
        "type": "navigate",
        "label": "Open planning workspace",
        "payload": {
          "path": "/"
        }
      }
    ]
  }
}
```

## Implementation Lock Statement

Frontend and backend implementations must treat this file as the source of truth for contract version 1.

Any breaking change requires:
1. New contract version
2. Explicit migration note
3. Coordinated frontend and backend rollout
