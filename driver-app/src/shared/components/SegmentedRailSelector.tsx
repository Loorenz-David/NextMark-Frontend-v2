export type SegmentedRailOption<OptionId extends string> = {
  id: OptionId
  label: string
  activeClassName?: string
  isDisabled?: boolean
}

type SegmentedRailSelectorProps<OptionId extends string> = {
  options: SegmentedRailOption<OptionId>[]
  value: OptionId
  onChange: (value: OptionId) => void
  isDisabled?: boolean
  isLoading?: boolean
}

export function SegmentedRailSelector<OptionId extends string>({
  options,
  value,
  onChange,
  isDisabled = false,
  isLoading = false,
}: SegmentedRailSelectorProps<OptionId>) {
  return (
    <div className="flex w-full items-center rounded-2xl border border-white/10 bg-white/6 p-1">
      {options.map((option) => {
        const isActive = option.id === value

        return (
          <button
            key={option.id}
            className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
              isActive
                ? option.activeClassName ?? 'border-white/15 bg-white/14 text-white'
                : 'border-transparent text-white/58'
            } ${isLoading ? 'cursor-wait' : ''}`}
            disabled={isDisabled || isLoading || isActive || option.isDisabled}
            onClick={() => onChange(option.id)}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
