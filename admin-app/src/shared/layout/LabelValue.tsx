import type { ReactNode } from 'react'
import { formatValue } from './labelValue.domain'

type LabelValueProps = {
  label: string
  value?: string | number | null | ReactNode
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
