import { Switch } from '@/shared/inputs/Switch'

type CostumerPanelUpdateToggleProps = {
  value: boolean
  onChange: (value: boolean) => void
}

export const CostumerPanelUpdateToggle = ({
  value,
  onChange,
}: CostumerPanelUpdateToggleProps) => (
  <div className="flex min-w-0 items-center gap-1.5">
    <span className="truncate text-[10px] font-medium text-[var(--color-muted)]">
      Update profile
    </span>
    <Switch
      value={value}
      onChange={onChange}
      sizeClassName="h-7 w-12"
      ariaLabel="Update linked customer profile"
    />
  </div>
)
