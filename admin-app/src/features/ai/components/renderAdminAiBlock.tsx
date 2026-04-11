import type {
  AiAnalyticsBarListData,
  AiAnalyticsMetricGridData,
  AiAnalyticsTableData,
  AiBlockRendererProps,
} from '@nextmark/ai-panel'
import type { Order } from '@shared-domain'

import { AiAnalyticsBarList } from './AiAnalyticsBarList'
import { AiAnalyticsKpi } from './AiAnalyticsKpi'
import { AiAnalyticsMetricGrid } from './AiAnalyticsMetricGrid'
import { AiAnalyticsNarrativeBlock } from './AiAnalyticsNarrativeBlock'
import { AiAnalyticsTable } from './AiAnalyticsTable'
import { AiOrderCard } from './AiOrderCard'
import { AiOrdersTable, type AiOrdersTableColumnExternalId } from './AiOrdersTable'

interface AdminAiBlockRenderOptions {
  onOrderRowClick?: (order: Order) => void
}

// Trust the block's entity_type declaration — any non-null object is a valid
// candidate when we're already inside an `entity_type: "order"` block.
function isNonNullObject(value: unknown): value is Order {
  return typeof value === 'object' && value !== null
}

function getOrdersFromBlockData(data: unknown): Order[] {
  if (Array.isArray(data)) {
    return data.filter(isNonNullObject)
  }

  if (typeof data === 'object' && data !== null) {
    const d = data as Record<string, unknown>

    // Accept either `items` or `orders` as the collection key
    const list = Array.isArray(d.items) ? d.items
      : Array.isArray(d.orders) ? d.orders
      : null

    if (list) {
      return list.filter(isNonNullObject)
    }
  }

  return []
}

function isOrdersTableColumnId(value: unknown): value is AiOrdersTableColumnExternalId {
  return value === 'order_scalar_id'
    || value === 'order_id'
    || value === 'total_items'
    || value === 'client_name'
    || value === 'street_address'
}

function getOrdersTableColumnsFromMeta(meta: unknown): AiOrdersTableColumnExternalId[] | undefined {
  if (typeof meta !== 'object' || meta === null) return undefined

  const candidate = (meta as { columns?: unknown; table?: { columns?: unknown } }).table?.columns
    ?? (meta as { columns?: unknown }).columns

  if (!Array.isArray(candidate)) return undefined

  const columns = candidate.filter(isOrdersTableColumnId)
  return columns.length ? columns : undefined
}

function isAnalyticsMetricGridData(value: unknown): value is AiAnalyticsMetricGridData {
  return typeof value === 'object' && value !== null && Array.isArray((value as { metrics?: unknown }).metrics)
}

function isAnalyticsBarListData(value: unknown): value is AiAnalyticsBarListData {
  return typeof value === 'object' && value !== null && Array.isArray((value as { items?: unknown }).items)
}

function isAnalyticsTableData(value: unknown): value is AiAnalyticsTableData {
  return typeof value === 'object'
    && value !== null
    && Array.isArray((value as { columns?: unknown }).columns)
    && Array.isArray((value as { rows?: unknown }).rows)
}

function isNarrativeSummaryData(value: unknown): value is { text: string } {
  return typeof value === 'object' && value !== null && typeof (value as { text?: unknown }).text === 'string'
}

function isLegacyAnalyticsKpiData(
  value: unknown,
): value is {
  metric_name?: string
  value?: number | string
  display_value?: string
  delta?: number | string
  unit?: string
  description?: string
  confidence_score?: number
} {
  return typeof value === 'object' && value !== null && (
    typeof (value as { metric_name?: unknown }).metric_name === 'string'
      || typeof (value as { value?: unknown }).value === 'number'
      || typeof (value as { display_value?: unknown }).display_value === 'string'
  )
}

function isLegacyAnalyticsTrendData(
  value: unknown,
): value is {
  description?: string
  confidence_score?: number
  data_points: Array<{ label: string; value: number }>
} {
  return typeof value === 'object'
    && value !== null
    && Array.isArray((value as { data_points?: unknown }).data_points)
}

function isLegacyAnalyticsBreakdownData(
  value: unknown,
): value is {
  description?: string
  confidence_score?: number
  components: Array<{ label: string; value: number; percentage?: number }>
} {
  return typeof value === 'object'
    && value !== null
    && Array.isArray((value as { components?: unknown }).components)
}

export function renderAdminAiBlock(
  { block }: AiBlockRendererProps,
  options: AdminAiBlockRenderOptions = {},
) {
  const { onOrderRowClick } = options

  if (block.kind === 'summary' && isNarrativeSummaryData(block.data)) {
    return (
      <AiAnalyticsNarrativeBlock
        subtitle={block.subtitle}
        text={block.data.text}
        title={block.title}
      />
    )
  }

  if (block.kind === 'analytics_kpi' && isLegacyAnalyticsKpiData(block.data)) {
    return <AiAnalyticsKpi data={block.data} subtitle={block.subtitle} title={block.title} />
  }

  if (block.kind === 'analytics_trend' && isLegacyAnalyticsTrendData(block.data)) {
    return (
      <AiAnalyticsBarList
        data={{
          items: block.data.data_points.map((item, index) => ({
            id: `trend_${index + 1}`,
            label: item.label,
            value: item.value,
          })),
        }}
        meta={{
          ...block.meta,
          sourceKind: 'analytics_trend',
        }}
      />
    )
  }

  if (block.kind === 'analytics_breakdown' && isLegacyAnalyticsBreakdownData(block.data)) {
    return (
      <AiAnalyticsBarList
        data={{
          items: block.data.components.map((item, index) => ({
            id: `breakdown_${index + 1}`,
            label: item.label,
            value: item.value,
            displayValue: typeof item.percentage === 'number' ? `${item.percentage}%` : undefined,
          })),
        }}
        meta={block.meta}
      />
    )
  }

  if (block.entityType === 'analytics' || block.kind === 'analytics') {
    if (block.layout === 'metric_grid' && isAnalyticsMetricGridData(block.data)) {
      return <AiAnalyticsMetricGrid data={block.data} />
    }

    if (block.layout === 'bar_list' && isAnalyticsBarListData(block.data)) {
      return <AiAnalyticsBarList data={block.data} meta={block.meta} />
    }

    if (block.layout === 'table' && isAnalyticsTableData(block.data)) {
      return <AiAnalyticsTable data={block.data} />
    }

    return null
  }

  if (block.entityType !== 'order') {
    return null
  }

  if (block.kind === 'entity_detail' && isNonNullObject(block.data)) {
    return <AiOrderCard onRowClick={onOrderRowClick} order={block.data} />
  }

  if (block.kind === 'entity_collection') {
    const orders = getOrdersFromBlockData(block.data)
    if (!orders.length) {
      return null
    }

    // `cards` layout renders individual cards; everything else renders a table
    if (block.layout === 'cards') {
      return (
        <div style={{ display: 'grid', gap: 8 }}>
          {orders.map((order, i) => (
            <AiOrderCard key={order.id ?? order.order_scalar_id ?? i} onRowClick={onOrderRowClick} order={order} />
          ))}
        </div>
      )
    }

    return (
      <AiOrdersTable
        columns={getOrdersTableColumnsFromMeta(block.meta)}
        onRowClick={onOrderRowClick}
        orders={orders}
      />
    )
  }

  return null
}
