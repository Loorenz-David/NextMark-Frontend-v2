import { memo } from 'react'

import type { AiAnalyticsTableData } from '@nextmark/ai-panel'

interface AiAnalyticsTableProps {
  data: AiAnalyticsTableData
}

function toCellValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (typeof value === 'number' || typeof value === 'string') {
    return String(value)
  }

  return JSON.stringify(value)
}

function getColumnAlignmentClassName(align?: string): string {
  if (align === 'right') return 'text-right'
  if (align === 'center') return 'text-center'
  return 'text-left'
}

function AiAnalyticsTableComponent({ data }: AiAnalyticsTableProps) {
  return (
    <div className="admin-glass-panel admin-surface-compact overflow-hidden rounded-lg border border-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-xs text-[var(--color-text)]">
          <thead className="bg-white/[0.04] text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            <tr>
              {data.columns.map((column) => (
                <th
                  key={column.id}
                  className={`px-3 py-2.5 font-medium ${getColumnAlignmentClassName(column.align)}`.trim()}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr
                key={(typeof row.id === 'string' && row.id) || `${rowIndex}`}
                className="border-t border-white/8 text-[var(--color-text)]/92"
              >
                {data.columns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-3 py-2.5 ${getColumnAlignmentClassName(column.align)}`.trim()}
                  >
                    {toCellValue(row[column.id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const AiAnalyticsTable = memo(AiAnalyticsTableComponent)