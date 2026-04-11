type CostumerPanelDisplayInfoProps = {
  label: string
  value: string
}

export const CostumerPanelDisplayInfo = ({
  label,
  value,
}: CostumerPanelDisplayInfoProps) => {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="text-[10px] font-semibold text-[var(--color-muted)]">{label}</span>
      <div className="flex min-w-0 gap-1 text-[14px]">
        <span className="min-w-0 break-words">{value}</span>
      </div>
    </div>
  )
}
