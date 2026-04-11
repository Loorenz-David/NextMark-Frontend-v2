import { useMemo } from 'react'

import { CloseIcon } from '@/assets/icons'
import { cn } from '@/lib/utils/cn'

type ActiveFilterEntry =
  | {
      type: 'single'
      parentKey: string
      itemKey: string
      value: unknown
    }
  | {
      type: 'array'
      parentKey: string
      itemKey: string
      value: unknown
    }

type ActiveFilterPillsProps = {
  filters: Record<string, unknown>
  removeFilter: (key: string, value?: unknown) => void
  formatFilterLabel?: (key: string, value: unknown) => string
  className?: string
}

const formatFallbackLabel = (key: string, value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return `${key}: ${String(value)}`
  }

  if (Array.isArray(value)) {
    return `${key}: ${value.map((item) => String(item)).join(', ')}`
  }

  return `${key}: ${String(value)}`
}

export const ActiveFilterPills = ({
  filters,
  removeFilter,
  formatFilterLabel,
  className,
}: ActiveFilterPillsProps) => {

  const activeEntries = useMemo<ActiveFilterEntry[]>(() => {
    return Object.entries(filters)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .flatMap((entry): ActiveFilterEntry[] => {
        const [key, value] = entry
        if (Array.isArray(value)) {
          return value.map((item) => ({
            type: 'array' as const,
            parentKey: key,
            itemKey: String(item),
            value: item,
          }))
        }

        return [
          {
            type: 'single' as const,
            parentKey: key,
            itemKey: key,
            value,
          },
        ]
      })
  }, [filters])

  if (!activeEntries.length) return null

  const renderPillLabel = (key: string, value: unknown) =>
    formatFilterLabel ? formatFilterLabel(key, value) : formatFallbackLabel(key, value)

  return (
    <div className={cn('flex flex-nowrap items-center gap-2 overflow-x-auto pb-3', className)}>
      {activeEntries.map((entry) => {
        const { type, parentKey, itemKey, value } = entry

        return (
          <div
            key={`${parentKey}-${itemKey}`}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--color-light-blue-r),0.32)] bg-[rgba(var(--color-light-blue-r),0.14)] px-3 py-1 text-xs font-medium text-[rgb(var(--color-light-blue-r))] shadow-[0_8px_18px_rgba(0,0,0,0.14)] backdrop-blur-md"
          >
            <span className="whitespace-nowrap">
              {type === 'array'
                ? renderPillLabel(parentKey === 's' ? itemKey : parentKey, value)
                : renderPillLabel(parentKey, value)}
            </span>

            <button
              type="button"
              aria-label={`Remove ${itemKey} filter`}
              onClick={() =>
                type === 'array'
                  ? removeFilter(parentKey, value)
                  : removeFilter(parentKey)
              }
              className="inline-flex items-center justify-center rounded-full p-0.5 text-[rgb(var(--color-light-blue-r))] transition-colors hover:bg-[rgba(var(--color-light-blue-r),0.18)] hover:text-white"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
