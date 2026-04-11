import { BasicButton } from '@/shared/buttons/BasicButton'
import { Switch } from '@/shared/inputs/Switch'

type PrintTemplateConfigHeaderProps = {
  enabled: boolean
  askPermission: boolean
  onBack: () => void
  onTogglePermission: (next: boolean) => void
  onToggleEnable: (next: boolean) => void
}

export const PrintTemplateConfigHeader = ({
  enabled,
  askPermission,
  onBack,
  onTogglePermission,
  onToggleEnable,
}: PrintTemplateConfigHeaderProps) => (
  <div className="mb-5 flex items-start justify-between gap-3 border-b border-[var(--color-border)]/70 pb-5">
    <BasicButton
      params={{
        variant: 'secondary',
        onClick: onBack,
        ariaLabel: 'Back to channel templates',
      }}
    >
      Back
    </BasicButton>
    <div className="flex items-end gap-10">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Ask for permission</span>
        <Switch value={askPermission} onChange={onTogglePermission} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Template is {enabled ? 'Enabled' : 'Disabled'}</span>
        <Switch value={enabled} onChange={onToggleEnable} />
      </div>
    </div>
  </div>
)
