import { BasicButton } from '@/shared/buttons/BasicButton'

import type { LabelDefinition } from './labelTypes'

type LabelPickerProps = {
  labels: LabelDefinition[]
  onSelect: (label: LabelDefinition) => void
  emptyMessage?: string
}

export const LabelPicker = ({ labels, onSelect, emptyMessage = 'No labels available.' }: LabelPickerProps) => {
  if (!labels.length) {
    return <p className="text-xs text-[var(--color-muted)]">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <BasicButton
          key={label.id}
          params={{
            variant: 'secondary',
            onClick: () => onSelect(label),
            className: 'px-3 py-1 text-xs',
            ariaLabel: `Insert ${label.displayName}`,
          }}
        >
          {label.displayName}
        </BasicButton>
      ))}
    </div>
  )
}
