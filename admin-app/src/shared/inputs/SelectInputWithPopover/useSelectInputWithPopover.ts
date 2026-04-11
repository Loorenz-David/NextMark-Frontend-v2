import { useCallback, useMemo, useState } from 'react'

import {
  filterOptions,
  formatOptionText,
  normalizeMultiValue,
  normalizeSingleValue,
} from './SelectInputWithPopover.helpers'
import type {
  MultiSelectInputWithPopoverProps,
  SelectInputWithPopoverLayoutProps,
  SelectInputWithPopoverProps,
  SelectOption,
  SingleSelectInputWithPopoverProps,
} from './SelectInputWithPopover.types'

const isMultipleMode = <TValue,>(
  props: SelectInputWithPopoverProps<TValue>,
): props is MultiSelectInputWithPopoverProps<TValue> => props.selectionMode === 'multiple'

const valuesEqual = <TValue,>(
  left: TValue,
  right: TValue,
  comparator?: (left: TValue, right: TValue) => boolean,
): boolean => {
  if (comparator) {
    return comparator(left, right)
  }
  return Object.is(left, right)
}

const getSingleSelectedOption = <TValue,>({
  options,
  selectedValue,
  isOptionEqual,
}: {
  options: SelectOption<TValue>[]
  selectedValue: TValue | string
  isOptionEqual?: (left: TValue, right: TValue) => boolean
}): SelectOption<TValue> | null => {
  const selectedText = typeof selectedValue === 'string' ? selectedValue : null

  return (
    options.find((option) => {
      if (selectedText !== null) {
        if (typeof option.value === 'string' && option.value === selectedText) {
          return true
        }
        return option.label === selectedText
      }

      return valuesEqual(option.value, selectedValue as TValue, isOptionEqual)
    }) ?? null
  )
}

export const useSelectInputWithPopover = <TValue,>(
  props: SelectInputWithPopoverProps<TValue>,
): SelectInputWithPopoverLayoutProps<TValue> => {
  const {
    options,
    displayMode = 'label',
    allowCustomInput = true,
    freeTextInput,
    placeholder = 'Select an option',
    noMatchMessage = 'No options match your search.',
    className,
    containerClassName,
    inputClassName,
    dropdownClassName,
    optionClassName,
    matchReferenceWidth = true,
    offset = 8,
    disabled = false,
    isOptionEqual,
  } = props

  const customInputEnabled = freeTextInput ?? allowCustomInput

  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const multipleMode = isMultipleMode(props)
  const currentValue = props.value
  const selectedValues = useMemo<TValue[]>(
    () =>
      multipleMode
        ? normalizeMultiValue((currentValue as MultiSelectInputWithPopoverProps<TValue>['value']) ?? [])
        : [],
    [currentValue, multipleMode],
  )
  const selectedValue = useMemo<TValue | string>(
    () =>
      multipleMode
        ? ''
        : normalizeSingleValue(currentValue as SingleSelectInputWithPopoverProps<TValue>['value']),
    [currentValue, multipleMode],
  )

  const selectedOption = useMemo(
    () =>
      getSingleSelectedOption({
        options,
        selectedValue,
        isOptionEqual,
      }),
    [isOptionEqual, options, selectedValue],
  )

  const filteredOptions = useMemo(() => filterOptions(options, searchValue), [options, searchValue])

  const displayValue = useMemo(() => {
    if (multipleMode) {
      if (open && searchValue) {
        return searchValue
      }
      if (selectedValues.length > 0) {
        return `${selectedValues.length} selected`
      }
      return searchValue
    }

    if (open && searchValue) {
      return searchValue
    }

    if (selectedOption) {
      return formatOptionText(selectedOption, displayMode)
    }

    return typeof selectedValue === 'string' ? selectedValue : searchValue
  }, [
    displayMode,
    multipleMode,
    open,
    searchValue,
    selectedOption,
    selectedValue,
    selectedValues.length,
  ])

  const isOptionSelected = useCallback(
    (option: SelectOption<TValue>) => {
      if (multipleMode) {
        return selectedValues.some((value) => valuesEqual(value, option.value, isOptionEqual))
      }

      if (!selectedOption) {
        return false
      }

      return valuesEqual(selectedOption.value, option.value, isOptionEqual)
    },
    [isOptionEqual, multipleMode, selectedOption, selectedValues],
  )

  const onInputFocus = useCallback(() => {
    if (disabled) {
      return
    }
    setOpen(true)
  }, [disabled])

  const onArrowClick = useCallback(() => {
    if (disabled) {
      return
    }
    setOpen((current) => !current)
  }, [disabled])

  const onOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (disabled) {
        return
      }
      setOpen(nextOpen)
    },
    [disabled],
  )

  const onInputChange = useCallback(
    (value: string) => {
      if (disabled) {
        return
      }

      setSearchValue(value)
      setOpen(true)

      if (!multipleMode && customInputEnabled) {
        props.onChange(value)
      }
    },
    [customInputEnabled, disabled, multipleMode, props],
  )

  const onOptionClick = useCallback(
    (option: SelectOption<TValue>) => {
      if (disabled) {
        return
      }

      if (multipleMode) {
        const multiProps = props as MultiSelectInputWithPopoverProps<TValue>
        const exists = selectedValues.some((value) => valuesEqual(value, option.value, isOptionEqual))
        const nextValues = exists
          ? selectedValues.filter((value) => !valuesEqual(value, option.value, isOptionEqual))
          : [...selectedValues, option.value]
        multiProps.onChange(nextValues)
        multiProps.onSelectOption?.(option)
        return
      }

      const singleProps = props as SingleSelectInputWithPopoverProps<TValue>
      singleProps.onChange(option.value)
      singleProps.onSelectOption?.(option)
      setSearchValue('')
      setOpen(false)
    },
    [disabled, isOptionEqual, multipleMode, props, selectedValues],
  )

  return {
    open,
    onOpenChange,
    displayValue,
    filteredOptions,
    isOptionSelected,
    onInputChange,
    onInputFocus,
    onArrowClick,
    onOptionClick,
    closeOnSelect: !multipleMode,
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
  }
}
