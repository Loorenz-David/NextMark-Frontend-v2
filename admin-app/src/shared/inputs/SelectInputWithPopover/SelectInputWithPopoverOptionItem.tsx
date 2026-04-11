import { formatOptionText } from './SelectInputWithPopover.helpers'
import type { SelectInputWithPopoverOptionItemProps } from './SelectInputWithPopover.types'

export const SelectInputWithPopoverOptionItem = <TValue,>({
  option,
  displayMode,
  selected,
  onClick,
  closeOnSelect,
  className,
}: SelectInputWithPopoverOptionItemProps<TValue>) => {
  const optionLabel = formatOptionText(option, displayMode)

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick()
      }}
      onMouseDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        selected
          ? 'bg-[var(--color-blue-500)]/10 text-[var(--color-blue-700)]'
          : 'text-[var(--color-text)] hover:bg-[var(--color-muted)]/10'
      } ${className ?? ''}`.trim()}
      data-popover-close={closeOnSelect ? 'true' : undefined}
    >
      {option.icon ? <span className="shrink-0">{option.icon}</span> : null}
      <span className="truncate">{optionLabel}</span>
    </button>
  )
}
