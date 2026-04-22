import { BoldArrowIcon } from '@/assets/icons'
import { InputField } from '@/shared/inputs/InputField'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'

import { SelectInputWithPopoverOptionsList } from './SelectInputWithPopoverOptionsList'
import type { SelectInputWithPopoverLayoutProps } from './SelectInputWithPopover.types'

export const SelectInputWithPopoverLayout = <TValue,>({
  open,
  onOpenChange,
  displayValue,
  filteredOptions,
  isOptionSelected,
  onInputChange,
  onInputFocus,
  onInputBlur,
  onArrowClick,
  onOptionClick,
  closeOnSelect,
  placeholder,
  noMatchMessage,
  displayMode,
  className,
  containerClassName,
  inputClassName,
  dropdownClassName,
  optionClassName,
  matchReferenceWidth,
  offset,
  disabled,
}: SelectInputWithPopoverLayoutProps<TValue>) => {
  return (
    <FloatingPopover
      open={open}
      onOpenChange={onOpenChange}
      classes={`relative w-full ${className ?? ''}`.trim()}
      offSetNum={offset}
      matchReferenceWidth={matchReferenceWidth}
      closeOnInsideClick={closeOnSelect}
      reference={
        <div className={`custom-field-container rounded-xl ${containerClassName ?? ''}`.trim()}>
          <InputField
            value={displayValue}
            onChange={(event) => onInputChange(event.target.value)}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            placeholder={placeholder}
            fieldClassName="w-full"
            inputClassName={inputClassName}
            disabled={disabled}
          />

          <button
            type="button"
            className="flex items-center content-center pr-2"
            onClick={(event) => {
              event.stopPropagation()
              requestAnimationFrame(() => {
                onArrowClick()
              })
            }}
            disabled={disabled}
            aria-label="Toggle options"
          >
            <BoldArrowIcon className={`h-3 w-3 ${open ? 'rotate-270' : 'rotate-90'}`} />
          </button>
        </div>
      }
    >
      <div
        className={`admin-glass-popover rounded-2xl border border-[var(--color-border-accent)] p-2 shadow-xl ${dropdownClassName ?? ''}`.trim()}
      >
        <SelectInputWithPopoverOptionsList
          filteredOptions={filteredOptions}
          isOptionSelected={isOptionSelected}
          onOptionClick={onOptionClick}
          closeOnSelect={closeOnSelect}
          displayMode={displayMode}
          noMatchMessage={noMatchMessage}
          optionClassName={optionClassName}
        />
      </div>
    </FloatingPopover>
  )
}
