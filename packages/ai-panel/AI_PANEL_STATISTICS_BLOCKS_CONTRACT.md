# AI Panel Statistics Blocks Contract

Status: LOCKED (implementation baseline)
Contract version: 1
Owner: Frontend AI Panel package
Applies to: thread message response payloads returned by `POST /ai/threads/:thread_id/messages`

## Purpose

Define the backend contract for statistical and analytics-oriented assistant blocks rendered inside the AI panel.

This contract extends the existing structured blocks model so one assistant response can interleave:

- narrative text
- KPI summaries
- ranked comparisons
- tabular analytics breakdowns

The package remains generic. Domain-specific analytics visuals are owned by host applications through `renderBlock`.

## Scope

This file defines:

- response shape expectations for analytics-capable assistant messages
- allowed analytics block kinds, entity types, and layouts
- canonical data shapes for metric grids, ranked bar lists, and analytics tables
- malformed/partial payload handling rules
- intent and rendering hints for mixed narrative + analytics responses
- versioning expectations

This file does not define:

- authentication or transport envelope details
- LLM prompt strategy or tool invocation logic
- app-specific component implementation
- cross-app visual styling

## Core Response Shape

Backend response payload must include:

```json
{
  "thread_id": "thr_analytics_001",
  "message": {
    "role": "assistant",
    "content": "Weekend demand is concentrated in three zones, with Central District contributing 42% of the observed volume.",
    "status_label": "Completed",
    "intent": "summary_with_blocks",
    "rendering_hints": {
      "has_blocks": true,
      "suppress_raw_data_preview": true,
      "text_section_title": "Narrative",
      "block_section_title": "Analytics"
    },
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
- `message.content`: string, present even when blocks are returned

Optional fields:

- `message.status_label`: string
- `message.intent`: `summary_with_blocks` | `blocks_only` | `narrative_only`
- `message.rendering_hints`: rendering metadata for section behavior
- `message.blocks`: ordered `AiMessageBlock[]`
- `message.actions`: conversation-level actions
- `message.tool_trace`: structured tool trace entries
- `message.typed_warnings`: recoverable warning list
- `message.data`: legacy fallback only during migration

## Analytics Block Model

Analytics responses can arrive in either of two compatible forms:

- canonical analytics blocks using `kind = analytics`
- narrative-native analytics blocks using `kind = analytics_kpi | analytics_trend | analytics_breakdown`

The current frontend supports both forms. Narrative-native kinds are normalized by the admin adapter into canonical renderable analytics blocks or summary blocks.

### Allowed enum values

`kind`:

- `entity_detail`
- `entity_collection`
- `summary`
- `stat`
- `analytics`
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

### Recommended kind/layout combinations

- `stat` + `key_value`: a compact scalar summary
- `analytics` + `metric_grid`: KPI-style metric cards
- `analytics` + `bar_list`: ranked comparisons with proportional values
- `analytics` + `table`: detailed tabular breakdown

Unsupported combinations must not crash the frontend. Hosts may fall back to generic rendering.

## Narrative-Native Analytics Kinds

These kinds are useful when backend generation is closer to analytical storytelling than a pre-normalized UI block list.

### `analytics_kpi`

Use for a single KPI with optional delta and confidence metadata.

```json
{
  "id": "blk_kpi_1",
  "kind": "analytics_kpi",
  "title": "Delivery completion rate",
  "data": {
    "metric_name": "Completion rate",
    "value": 96.5,
    "display_value": "96.5%",
    "delta": 2.1,
    "unit": "%",
    "description": "Compared to the previous 7-day window",
    "confidence_score": 0.92
  },
  "meta": {
    "schema_version": 1
  }
}
```

### `analytics_trend`

Use for trend narratives with optional plottable points.

```json
{
  "id": "blk_trend_1",
  "kind": "analytics_trend",
  "title": "Route efficiency",
  "data": {
    "description": "Average minutes per stop decreased across the last 4 weeks.",
    "direction": "down",
    "confidence_score": 0.87,
    "data_points": [
      { "label": "Week 1", "value": 8.2 },
      { "label": "Week 2", "value": 8.0 },
      { "label": "Week 3", "value": 7.9 }
    ]
  },
  "meta": {
    "schema_version": 1
  }
}
```

### `analytics_breakdown`

Use for distribution or composition analysis.

```json
{
  "id": "blk_breakdown_narrative_1",
  "kind": "analytics_breakdown",
  "title": "Delivery status distribution",
  "data": {
    "description": "Completed orders account for over two thirds of the current workload.",
    "components": [
      { "label": "Completed", "value": 847, "percentage": 67.8 },
      { "label": "Preparing", "value": 312, "percentage": 24.9 }
    ],
    "confidence_score": 0.95
  },
  "meta": {
    "schema_version": 1
  }
}
```

Normalization expectations:

- `analytics_kpi` becomes a canonical `analytics + metric_grid` block
- `analytics_breakdown` becomes a canonical `analytics + bar_list` block
- `analytics_trend` becomes a canonical `analytics + bar_list` block when points exist
- `analytics_trend` may fall back to a `summary` block when only descriptive text is available

## Canonical Analytics Data Shapes

### A. Metric grid

Use for 2-8 headline metrics.

```json
{
  "id": "blk_metrics_1",
  "kind": "analytics",
  "entity_type": "analytics",
  "layout": "metric_grid",
  "title": "Core metrics",
  "subtitle": "Last 30 days",
  "data": {
    "metrics": [
      {
        "id": "total_orders",
        "label": "Orders",
        "value": 1842,
        "display_value": "1,842",
        "change_label": "+12.4% vs prior period",
        "trend": "up",
        "value_type": "integer"
      },
      {
        "id": "avg_delivery_time",
        "label": "Avg delivery time",
        "value": 38.2,
        "display_value": "38.2 min",
        "trend": "down",
        "value_type": "duration_minutes"
      }
    ]
  }
}
```

Required data fields:

- `data.metrics`: non-empty array
- each metric must include `id`, `label`, and either numeric `value` or string `display_value`

### B. Ranked bar list

Use for top-N comparison blocks.

```json
{
  "id": "blk_zone_rank_1",
  "kind": "analytics",
  "entity_type": "analytics",
  "layout": "bar_list",
  "title": "Orders by zone",
  "data": {
    "items": [
      {
        "id": "central",
        "label": "Central District",
        "value": 42,
        "display_value": "42%",
        "hint": "Peak weekend density"
      },
      {
        "id": "north",
        "label": "North Corridor",
        "value": 27,
        "display_value": "27%"
      }
    ]
  }
}
```

Required data fields:

- `data.items`: non-empty array
- each item must include `id`, `label`, and numeric `value`

### C. Analytics table

Use for detailed drilldown blocks.

```json
{
  "id": "blk_breakdown_1",
  "kind": "analytics",
  "entity_type": "analytics",
  "layout": "table",
  "title": "Carrier breakdown",
  "data": {
    "columns": [
      { "id": "carrier", "label": "Carrier" },
      { "id": "orders", "label": "Orders", "align": "right" },
      { "id": "share", "label": "Share", "align": "right" }
    ],
    "rows": [
      { "id": "carrier_a", "carrier": "Carrier A", "orders": 812, "share": "44.1%" },
      { "id": "carrier_b", "carrier": "Carrier B", "orders": 503, "share": "27.3%" }
    ]
  }
}
```

Required data fields:

- `data.columns`: non-empty array with `id` and `label`
- `data.rows`: array of records

## Ordering Rules

`message.blocks[]` is rendered in array order.

Recommended ordering for mixed responses:

1. narrative text in `message.content`
2. summary KPI block (`metric_grid` or scalar `stat`)
3. comparative block (`bar_list`)
4. detailed breakdown (`table`)

Backend should order blocks for the intended reading flow instead of expecting frontend reordering.

## Intent and Rendering Rules

### `intent = summary_with_blocks`

- frontend renders both narrative and blocks
- preferred default for analytics responses

### `intent = blocks_only`

- frontend hides narrative text
- use only when text would fully duplicate the analytics blocks

### `intent = narrative_only`

- frontend hides blocks even if backend included them
- use only for fallback or experimentation

### Rendering hints

Recommended analytics hints:

```json
{
  "has_blocks": true,
  "suppress_raw_data_preview": true,
  "text_section_title": "Narrative",
  "block_section_title": "Analytics"
}
```

Rules:

- `has_blocks` should be true when `blocks` contains renderable entries
- `suppress_raw_data_preview` should be true for analytics responses so raw JSON is not duplicated under the block UI
- section titles should be supplied when backend wants explicit separation between text and analytics

## Malformed and Partial Data Policy

Backend must send best-effort valid blocks.

Frontend behavior is intentionally tolerant:

- invalid analytics block shape: skip that block only
- valid narrative with invalid blocks: keep narrative visible
- partially valid blocks array: render only valid blocks in original order
- unknown enum values: do not crash, allow generic fallback or omission

Backend should prefer omitting an uncertain block instead of sending placeholder arrays with invalid rows.

## Empty-State Rules

- do not send analytics blocks with empty `metrics`, `items`, or `columns`
- if no analytics data exists, use narrative-only response or a standard summary block with explicit empty-state messaging
- frontend may suppress entirely empty analytics blocks even when `has_blocks = true`

## Versioning Policy

Recommended block metadata:

```json
{
  "schema_version": 1
}
```

Rules:

- additive fields are allowed in version 1
- enum removal or field renaming is breaking and requires a new contract version
- backend may include per-block `meta.schema_version`; frontend should default to version 1 when absent

Recommended metadata fields for analytics responses:

- `meta.schema_version`: integer version, currently `1`
- `meta.source_kind`: optional original kind when backend or adapter normalizes a block
- `meta.direction`: optional trend direction for trend-derived blocks
- `meta.confidence_score`: optional 0-1 confidence indicator

## Canonical Mixed Example

```json
{
  "thread_id": "thr_analytics_001",
  "message": {
    "role": "assistant",
    "content": "Weekend demand is concentrated in three zones, with Central District contributing 42% of the observed volume.",
    "status_label": "Completed",
    "intent": "summary_with_blocks",
    "rendering_hints": {
      "has_blocks": true,
      "suppress_raw_data_preview": true,
      "text_section_title": "Narrative",
      "block_section_title": "Analytics"
    },
    "blocks": [
      {
        "id": "blk_metrics_1",
        "kind": "analytics",
        "entity_type": "analytics",
        "layout": "metric_grid",
        "title": "Core metrics",
        "data": {
          "metrics": [
            {
              "id": "total_orders",
              "label": "Orders",
              "value": 1842,
              "display_value": "1,842",
              "change_label": "+12.4% vs prior period",
              "trend": "up",
              "value_type": "integer"
            },
            {
              "id": "avg_delivery_time",
              "label": "Avg delivery time",
              "value": 38.2,
              "display_value": "38.2 min",
              "trend": "down",
              "value_type": "duration_minutes"
            }
          ]
        },
        "meta": {
          "schema_version": 1
        }
      },
      {
        "id": "blk_zone_rank_1",
        "kind": "analytics",
        "entity_type": "analytics",
        "layout": "bar_list",
        "title": "Orders by zone",
        "data": {
          "items": [
            {
              "id": "central",
              "label": "Central District",
              "value": 42,
              "display_value": "42%"
            },
            {
              "id": "north",
              "label": "North Corridor",
              "value": 27,
              "display_value": "27%"
            }
          ]
        },
        "meta": {
          "schema_version": 1
        }
      },
      {
        "id": "blk_breakdown_1",
        "kind": "analytics",
        "entity_type": "analytics",
        "layout": "table",
        "title": "Carrier breakdown",
        "data": {
          "columns": [
            { "id": "carrier", "label": "Carrier" },
            { "id": "orders", "label": "Orders", "align": "right" },
            { "id": "share", "label": "Share", "align": "right" }
          ],
          "rows": [
            { "id": "carrier_a", "carrier": "Carrier A", "orders": 812, "share": "44.1%" },
            { "id": "carrier_b", "carrier": "Carrier B", "orders": 503, "share": "27.3%" }
          ]
        },
        "meta": {
          "schema_version": 1
        }
      }
    ],
    "actions": []
  }
}
```

## Backend Checklist

Before emitting analytics/statistical blocks, backend should verify:

- `message.content` is still present even when blocks carry most of the payload
- blocks are already ordered for reading flow
- empty analytics arrays are omitted instead of emitted
- `rendering_hints.has_blocks = true` only when at least one renderable block is present
- `suppress_raw_data_preview = true` for analytics-heavy responses
- `meta.schema_version = 1` is included where practical

## Frontend Compatibility Notes

Current admin frontend behavior:

- canonical `analytics` blocks render through admin analytics components
- `analytics_kpi`, `analytics_trend`, and `analytics_breakdown` are normalized in `adminAiPanelAdapter.ts`
- malformed analytics blocks are skipped without failing the whole message
- narrative remains visible when analytics normalization fails

## Implementation Lock Statement

Backend and frontend implementations should treat this file as the source of truth for version 1 statistics blocks.