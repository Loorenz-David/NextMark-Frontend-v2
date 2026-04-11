import type {
  AiAnalyticsBarItem,
  AiAnalyticsBarListData,
  AiAnalyticsBlockData,
  AiAnalyticsMetric,
  AiAnalyticsMetricGridData,
  AiAnalyticsTableColumn,
  AiAnalyticsTableData,
  AiAnalyticsTableRow,
  AiMessageBlock,
} from '@nextmark/ai-panel'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeMetric(value: unknown): AiAnalyticsMetric | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.label !== 'string') {
    return null
  }

  if (typeof value.value !== 'number' && typeof value.value !== 'string' && typeof value.display_value !== 'string') {
    return null
  }

  return {
    id: value.id,
    label: value.label,
    value: typeof value.value === 'number' || typeof value.value === 'string' ? value.value : undefined,
    displayValue: typeof value.display_value === 'string'
      ? value.display_value
      : typeof value.displayValue === 'string'
        ? value.displayValue
        : undefined,
    description: typeof value.description === 'string' ? value.description : undefined,
    hint: typeof value.hint === 'string' ? value.hint : undefined,
    changeLabel: typeof value.change_label === 'string'
      ? value.change_label
      : typeof value.changeLabel === 'string'
        ? value.changeLabel
        : undefined,
    trend: value.trend === 'up' || value.trend === 'down' || value.trend === 'flat' ? value.trend : undefined,
    emphasis: value.emphasis === 'default' || value.emphasis === 'positive' || value.emphasis === 'warning' || value.emphasis === 'critical'
      ? value.emphasis
      : undefined,
    valueType: typeof value.value_type === 'string'
      ? value.value_type
      : typeof value.valueType === 'string'
        ? value.valueType
        : undefined,
    unit: typeof value.unit === 'string' ? value.unit : undefined,
  }
}

function normalizeBarItem(value: unknown): AiAnalyticsBarItem | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.label !== 'string' || typeof value.value !== 'number') {
    return null
  }

  return {
    id: value.id,
    label: value.label,
    value: value.value,
    displayValue: typeof value.display_value === 'string'
      ? value.display_value
      : typeof value.displayValue === 'string'
        ? value.displayValue
        : undefined,
    hint: typeof value.hint === 'string' ? value.hint : undefined,
    color: typeof value.color === 'string' ? value.color : undefined,
  }
}

function normalizeTableColumn(value: unknown): AiAnalyticsTableColumn | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.label !== 'string') {
    return null
  }

  return {
    id: value.id,
    label: value.label,
    align: value.align === 'left' || value.align === 'center' || value.align === 'right' ? value.align : undefined,
  }
}

function normalizeTableRow(value: unknown): AiAnalyticsTableRow | null {
  if (!isRecord(value)) {
    return null
  }

  return value as AiAnalyticsTableRow
}

export function normalizeAiAnalyticsBlockData(block: Pick<AiMessageBlock, 'layout' | 'data'>): AiAnalyticsBlockData | null {
  if (!isRecord(block.data)) {
    return null
  }

  if (block.layout === 'metric_grid') {
    if (!Array.isArray(block.data.metrics)) {
      return null
    }

    const metrics = block.data.metrics
      .map(normalizeMetric)
      .filter((metric): metric is AiAnalyticsMetric => metric !== null)

    if (!metrics.length) {
      return null
    }

    return { metrics } satisfies AiAnalyticsMetricGridData
  }

  if (block.layout === 'bar_list') {
    if (!Array.isArray(block.data.items)) {
      return null
    }

    const items = block.data.items
      .map(normalizeBarItem)
      .filter((item): item is AiAnalyticsBarItem => item !== null)

    if (!items.length) {
      return null
    }

    return { items } satisfies AiAnalyticsBarListData
  }

  if (block.layout === 'table') {
    if (!Array.isArray(block.data.columns) || !Array.isArray(block.data.rows)) {
      return null
    }

    const columns = block.data.columns
      .map(normalizeTableColumn)
      .filter((column): column is AiAnalyticsTableColumn => column !== null)

    const rows = block.data.rows
      .map(normalizeTableRow)
      .filter((row): row is AiAnalyticsTableRow => row !== null)

    if (!columns.length || !rows.length) {
      return null
    }

    return { columns, rows } satisfies AiAnalyticsTableData
  }

  return null
}