import { Switch } from '@/shared/inputs/Switch'

type ClientFormToggleRowProps = {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  /** Shown instead of `description` while the toggle has no effect. */
  disabledHint?: string
}

export const ClientFormToggleRow = ({
  label,
  description,
  value,
  onChange,
  disabled = false,
  disabledHint,
}: ClientFormToggleRowProps) => (
  <div
    className={`flex items-center justify-between gap-4 rounded-[20px] border border-white/[0.08] bg-white/[0.04] px-4 py-3 ${
      disabled ? 'opacity-60' : ''
    }`}
  >
    <div className="flex flex-col gap-0.5">
      <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
      <p className="text-xs text-[var(--color-muted)]">
        {disabled && disabledHint ? disabledHint : description}
      </p>
    </div>
    <Switch value={value} onChange={onChange} disabled={disabled} ariaLabel={label} sizeClassName="h-7 w-12" />
  </div>
)
