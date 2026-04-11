import { BasicButton } from '@/shared/buttons/BasicButton'
import type { LabelDefinition } from '@/shared/inputs/LabelPicker/labelTypes'

type SmsLabelsPanelProps = {
  labels: LabelDefinition[]
  onSelect: (label: LabelDefinition) => void
}

export const SmsLabelsPanel = ({ labels, onSelect }: SmsLabelsPanelProps) => {
  return (
    <aside className="admin-glass-panel-strong rounded-[26px] bg-[linear-gradient(180deg,rgba(13,21,22,0.98),rgba(10,17,18,0.98))] p-5 shadow-none">
      <div className="rounded-[18px] border border-[#83ccb9]/12 bg-[linear-gradient(135deg,rgba(131,204,185,0.08),rgba(94,209,215,0.04))] px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[#83ccb9]/28 bg-[#83ccb9]/16 px-1.5 text-[0.7rem] font-semibold text-[#a7f0de]">
            +
          </span>
          <span className="font-medium">Tap a label and it appears inside the live SMS bubble.</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Labels
        </p>
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Insert dynamic values</h3>
        <p className="text-sm leading-6 text-[var(--color-muted)]">
          Use these placeholders to personalize the message without rewriting each template by
          hand.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {labels.map((label) => (
          <BasicButton
            key={label.id}
            params={{
              variant: 'secondary',
              onClick: () => onSelect(label),
              className: 'px-3 py-1.5 text-xs',
              ariaLabel: `Insert ${label.displayName}`,
            }}
          >
            {label.displayName}
          </BasicButton>
        ))}
      </div>
    </aside>
  )
}
