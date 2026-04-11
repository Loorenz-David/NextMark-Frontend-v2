import type { KeyboardEventHandler, RefObject } from 'react'

import { CalendarIcon } from '@/assets/icons'
import { fieldContainer, fieldInput } from '@/constants/classes'

import { DATE_PLACEHOLDER } from '../model/customDatePicker.utils'

type CustomDatePickerInputProps = {
  value: string
  showTodayLabel: boolean
  readOnly?: boolean
  disabled?: boolean
  className?: string
  onOpen: () => void
  onBlur: () => void
  onKeyDown: KeyboardEventHandler<HTMLInputElement>
  onChange: (value: string) => void
  inputRef: RefObject<HTMLInputElement | null>
}

export const CustomDatePickerInput = ({
  value,
  showTodayLabel,
  readOnly,
  disabled,
  className = fieldContainer,
  onOpen,
  onBlur,
  onKeyDown,
  onChange,
  inputRef,
}: CustomDatePickerInputProps) => {
  return (
    <div
      className={`flex items-center gap-2 ${disabled ? 'opacity-60' : ''} ${className ?? ''}`}
      onClick={() => {
        if (disabled) return
        onOpen()
      }}
    >
      <button
        type='button'
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault()
          onOpen()
        }}
        className='flex shrink-0 items-center justify-center disabled:cursor-not-allowed'
        aria-label='Open date picker'
      >
        <CalendarIcon className='h-4 w-4 stroke-[var(--color-muted)]/80' />
      </button>

        <input
          ref={inputRef}
          value={value}
          placeholder={DATE_PLACEHOLDER}
          readOnly={readOnly}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className={`${fieldInput} min-w-0 ${readOnly ? "w-full" : "max-w-[90px]"}`}
        />

      {showTodayLabel ? (
        <span className='shrink-0 text-[9px] font-semibold text-blue-400'>Today</span>
      ) : null}
    </div>
  )
}
