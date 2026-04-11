import type { ReactNode } from 'react'

type LabelValueProps = {
  label: string
  value?: string | number | null | ReactNode
}

export const EMPTY_VALUE = '—'


export const formatValue = (value?: string | number | null) => {
  if (value == null) return EMPTY_VALUE
  if (typeof value === 'string' && value.trim() === '') return EMPTY_VALUE
  return value
}

export const LabelValue = ({ label, value }: LabelValueProps) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold text-[var(--color-muted)]">{label}</span>
    <span className="text-sm text-[var(--color-text)]">
        {typeof value == 'string' ?
            formatValue(value)
            :
            value
        }
        </span>
  </div>
)