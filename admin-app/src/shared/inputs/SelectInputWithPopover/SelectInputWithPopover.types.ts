import type { ReactNode } from 'react'

export type SelectOption<TValue = string> = {
  icon?: ReactNode
  label: string
  value: TValue
}

export type SelectDisplayMode = 'label' | 'value' | 'label-value'

type BaseProps<TValue> = {
  options: SelectOption<TValue>[]
  displayMode?: SelectDisplayMode
  allowCustomInput?: boolean
  freeTextInput?: boolean
  onBlur?: () => void
  placeholder?: string
  noMatchMessage?: string
  className?: string
  containerClassName?: string
  inputClassName?: string
  dropdownClassName?: string
  optionClassName?: string
  matchReferenceWidth?: boolean
  offset?: number
  disabled?: boolean
  isOptionEqual?: (left: TValue, right: TValue) => boolean
}

export type SingleSelectInputWithPopoverProps<TValue = string> = BaseProps<TValue> & {
  selectionMode?: 'single'
  value: TValue | string | null | undefined
  onChange: (value: TValue | string) => void
  onSelectOption?: (option: SelectOption<TValue>) => void
}

export type MultiSelectInputWithPopoverProps<TValue = string> = BaseProps<TValue> & {
  selectionMode: 'multiple'
  value: TValue[]
  onChange: (values: TValue[]) => void
  onSelectOption?: (option: SelectOption<TValue>) => void
}

export type SelectInputWithPopoverProps<TValue = string> =
  | SingleSelectInputWithPopoverProps<TValue>
  | MultiSelectInputWithPopoverProps<TValue>

export type SelectInputWithPopoverLayoutProps<TValue = string> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  displayValue: string
  filteredOptions: SelectOption<TValue>[]
  isOptionSelected: (option: SelectOption<TValue>) => boolean
  onInputChange: (value: string) => void
  onInputFocus: () => void
  onInputBlur?: () => void
  onArrowClick: () => void
  onOptionClick: (option: SelectOption<TValue>) => void
  closeOnSelect: boolean
  placeholder: string
  noMatchMessage: string
  displayMode: SelectDisplayMode
  className?: string
  containerClassName?: string
  inputClassName?: string
  dropdownClassName?: string
  optionClassName?: string
  matchReferenceWidth?: boolean
  offset?: number
  disabled?: boolean
}

export type SelectInputWithPopoverOptionItemProps<TValue = string> = {
  option: SelectOption<TValue>
  displayMode: SelectDisplayMode
  selected: boolean
  onClick: () => void
  closeOnSelect: boolean
  className?: string
}
