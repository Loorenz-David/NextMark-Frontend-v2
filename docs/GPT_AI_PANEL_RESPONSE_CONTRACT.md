# GPT AI Panel Response Contract

> Contract update notice:
> The locked structured blocks contract for ongoing implementation is now maintained in
> `packages/ai-panel/AI_PANEL_BACKEND_BLOCKS_CONTRACT.md` (contract version 1).
> Use that file as the source of truth for `message.blocks[]` payloads.

This document defines the backend extension expected by the installable AI panel package and the `admin-app` adapter.

## Goals

- keep frontend requests small
- move conversation authority to the backend
- make structured response actions deterministic
- avoid parsing assistant prose to discover UI actions

## Conversation Model

Every AI conversation is anchored to a `thread_id`.

### Required flow

1. Frontend creates or receives a `thread_id`
2. Frontend sends only the latest user message plus the `thread_id`
3. Backend resolves recent history for that thread
4. Backend builds the planner prompt from stored turns
5. Backend stores new user, tool, and assistant turns under that thread

## Recommended Backend Endpoints

### `POST /api_v2/ai/threads`

Creates a new AI thread.

Response:

```json
{
  "success": true,
  "data": {
    "thread_id": "thr_123"
  }
}
```

### `POST /api_v2/ai/threads/:thread_id/messages`

Submits a single new user message to an existing thread.

Request:

```json
{
  "message": "Find unscheduled orders for tomorrow",
  "context": {
    "route": "/",
    "app_scope": "admin"
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "thread_id": "thr_123",
    "message": {
      "role": "assistant",
      "content": "I found 12 unscheduled orders for tomorrow.",
      "status_label": "Completed",
      "actions": [
        {
          "id": "act_open_home",
          "type": "navigate",
          "label": "Open orders workspace",
          "payload": {
            "path": "/"
          }
        },
        {
          "id": "act_filter_orders",
          "type": "apply_order_filters",
          "label": "Apply filter",
          "payload": {
            "mode": "replace",
            "search": "",
            "filters": {
              "unschedule_order": true,
              "sort": "date_asc"
            }
          }
        }
      ],
      "tool_trace": [
        {
          "id": "tool_1",
          "tool": "list_orders",
          "status": "success",
          "summary": "Found 12 matching orders.",
          "params": {
            "scheduled": false,
            "limit": 12
          },
          "result": {
            "count": 12
          }
        }
      ],
      "data": {
        "count": 12
      }
    }
  }
}
```

### `GET /api_v2/ai/threads/:thread_id`

Optional rehydration endpoint if the frontend wants to restore a thread.

Response:

```json
{
  "success": true,
  "data": {
    "thread_id": "thr_123",
    "messages": [
      {
        "id": "msg_1",
        "role": "user",
        "content": "Find unscheduled orders for tomorrow",
        "created_at": "2026-03-20T12:00:00Z"
      },
      {
        "id": "msg_2",
        "role": "assistant",
        "content": "I found 12 unscheduled orders for tomorrow.",
        "created_at": "2026-03-20T12:00:02Z",
        "actions": [],
        "tool_trace": []
      }
    ]
  }
}
```

## Frontend Expectations

- frontend sends the newest message only
- frontend never sends the entire transcript back to the backend
- `thread_id` is the stable conversation key
- `actions` are explicit contract fields
- `tool_trace` is structured, not embedded in plain text
- frontend may keep local layout state, but thread history belongs to the backend

## Structured Action Rules

Actions must be deterministic and safe to render directly.

### Required fields

- `type`
- `label`
- optional `id`
- optional `payload`
- optional `disabled`
- optional `hint`

### V1 action scope

Allowed:

- `navigate`
- `open_settings`
- `apply_order_filters`
- `copy_text`

Not allowed in v1:

- direct write or mutation actions
- actions derived only from assistant prose

## Redis Thread Storage Guidance

Redis with TTL is a good v1 fit.

Recommended storage model:

- thread metadata key:
  - `thread_id`
  - `user_id`
  - `app_scope`
  - `session_scope_id`
  - timestamps
- ordered message/turn entries under the same thread
- sliding TTL refreshed on every new message

Recommended guardrails:

- cap recent turns by count or token budget
- verify thread ownership on every request
- add per-thread locking or version checks for concurrent requests
- support explicit thread reset/deletion
