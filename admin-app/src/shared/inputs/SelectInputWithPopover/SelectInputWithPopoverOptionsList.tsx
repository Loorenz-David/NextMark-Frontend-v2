import { SelectInputWithPopoverOptionItem } from './SelectInputWithPopoverOptionItem'
import type { SelectInputWithPopoverLayoutProps } from './SelectInputWithPopover.types'

type SelectInputWithPopoverOptionsListProps<TValue> = Pick<
  SelectInputWithPopoverLayoutProps<TValue>,
  | 'filteredOptions'
  | 'isOptionSelected'
  | 'onOptionClick'
  | 'closeOnSelect'
  | 'displayMode'
  | 'noMatchMessage'
  | 'optionClassName'
>

export const SelectInputWithPopoverOptionsList = <TValue,>({
  filteredOptions,
  isOptionSelected,
  onOptionClick,
  closeOnSelect,
  displayMode,
  noMatchMessage,
  optionClassName,
}: SelectInputWithPopoverOptionsListProps<TValue>) => {
  if (filteredOptions.length === 0) {
    return (
      <div className="whitespace-pre-line px-3 py-2 text-sm text-[var(--color-muted)]">
        {noMatchMessage}
      </div>
    )
  }

  return (
    <div className="flex max-h-64 flex-col gap-1 overflow-y-auto scroll-thin">
      {filteredOptions.map((option, index) => (
        <SelectInputWithPopoverOptionItem
          key={`${option.label}-${index}`}
          option={option}
          displayMode={displayMode}
          selected={isOptionSelected(option)}
          onClick={() => onOptionClick(option)}
          closeOnSelect={closeOnSelect}
          className={optionClassName}
        />
      ))}
    </div>
  )
}
