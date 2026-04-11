type RouteCardProps = {
  label: string
  dateRangeLabel: string
  isSelected?: boolean
  onSelect?: () => void
}

export function RouteCard({ label, dateRangeLabel, isSelected = false, onSelect }: RouteCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border px-4 py-3 text-left  transition ${
        isSelected
          ? 'border-emerald-300 bg-emerald-50/20'
          : 'border border-white/12 bg-white/6'
      }`}
    >
      <p className="text-sm font-semibold text-[var(--surface-strong)]">{label}</p>
      <p className="mt-1 text-xs text-[var(--surface-strong)]/50">{dateRangeLabel}</p>
    </button>
  )
}
