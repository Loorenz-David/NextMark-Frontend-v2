import { memo, useCallback, useMemo, type KeyboardEvent } from 'react'

import type { Order } from '@shared-domain'

export type AiOrdersTableColumnId =
  | 'order_scalar_id'
  | 'total_items'
  | 'client_name'
  | 'street_address'

export type AiOrdersTableColumnExternalId = AiOrdersTableColumnId | 'order_id'

const DEFAULT_ORDER_COLUMNS: AiOrdersTableColumnId[] = [
  'order_scalar_id',
  'total_items',
  'client_name',
  'street_address',
]

interface AiOrdersTableProps {
  orders: Order[]
  columns?: AiOrdersTableColumnExternalId[]
  onRowClick?: (order: Order) => void
}

function getOrderIdentifier(order: Order) {
  if (order.order_scalar_id != null) return String(order.order_scalar_id)
  if (order.reference_number) return order.reference_number
  return '-'
}

function getClientName(order: Order) {
  return [order.client_first_name, order.client_last_name].filter(Boolean).join(' ') || '-'
}

function getStreetAddress(order: Order) {
  return order.client_address?.street_address ?? '-'
}

function normalizeExternalColumnId(column: AiOrdersTableColumnExternalId): AiOrdersTableColumnId {
  return column === 'order_id' ? 'order_scalar_id' : column
}

function resolveColumns(columns?: AiOrdersTableColumnExternalId[]): AiOrdersTableColumnId[] {
  if (!columns?.length) return DEFAULT_ORDER_COLUMNS

  const allowed = new Set<AiOrdersTableColumnId>(DEFAULT_ORDER_COLUMNS)
  const unique: AiOrdersTableColumnId[] = []

  for (const externalColumn of columns) {
    const column = normalizeExternalColumnId(externalColumn)
    if (allowed.has(column) && !unique.includes(column)) {
      unique.push(column)
    }
  }

  return unique.length ? unique : DEFAULT_ORDER_COLUMNS
}

const COLUMN_CONFIG: Record<AiOrdersTableColumnId, {
  label: string
  headerClassName?: string
  cellClassName?: string
  render: (order: Order) => string | number
}> = {
  order_scalar_id: {
    label: 'Order #',
    cellClassName: 'px-3 py-2.5 font-medium',
    render: getOrderIdentifier,
  },
  total_items: {
    label: 'Items',
    cellClassName: 'px-3 py-2.5 text-[var(--color-muted)]',
    render: (order) => order.total_items ?? 0,
  },
  client_name: {
    label: 'Client',
    cellClassName: 'px-3 py-2.5',
    render: getClientName,
  },
  street_address: {
    label: 'Address',
    cellClassName: 'max-w-[220px] truncate px-3 py-2.5 text-[var(--color-muted)]',
    render: getStreetAddress,
  },
}

function AiOrdersTableComponent({ orders, columns, onRowClick }: AiOrdersTableProps) {
  const resolvedColumns = useMemo(() => resolveColumns(columns), [columns])
  const isInteractive = typeof onRowClick === 'function'

  const handleRowKeyDown = useCallback((event: KeyboardEvent<HTMLTableRowElement>, order: Order) => {
    if (!onRowClick) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onRowClick(order)
    }
  }, [onRowClick])

  return (
    <div className="admin-glass-panel admin-surface-compact overflow-hidden rounded-lg border border-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-xs text-[var(--color-text)]">
          <thead className="bg-white/[0.04] text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            <tr>
              {resolvedColumns.map((columnId) => {
                const column = COLUMN_CONFIG[columnId]
                return (
                  <th key={columnId} className={`px-3 py-2.5 font-medium ${column.headerClassName ?? ''}`.trim()}>
                    {column.label}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order.client_id ?? order.id ?? `${getOrderIdentifier(order)}-${index}`}
                aria-label={isInteractive ? `Open order ${getOrderIdentifier(order)} details` : undefined}
                className={`border-t border-white/8 text-[var(--color-text)]/92 ${isInteractive ? 'cursor-pointer transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-light-blue)]/60' : ''}`.trim()}
                onClick={isInteractive ? () => onRowClick(order) : undefined}
                onKeyDown={isInteractive ? (event) => handleRowKeyDown(event, order) : undefined}
                role={isInteractive ? 'button' : undefined}
                tabIndex={isInteractive ? 0 : undefined}
              >
                {resolvedColumns.map((columnId) => {
                  const column = COLUMN_CONFIG[columnId]
                  return (
                    <td key={columnId} className={column.cellClassName ?? 'px-3 py-2.5'}>
                      {column.render(order)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const AiOrdersTable = memo(AiOrdersTableComponent)
