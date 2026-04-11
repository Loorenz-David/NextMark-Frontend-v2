import { useState } from 'react'
import type { KeyboardEvent } from 'react'

import { fieldContainer } from '@/constants/classes'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { InputField } from '@/shared/inputs/InputField'

export type TagInputProps = {
  values: string[]
  onAdd: (value: string) => void
  onRemove: (value: string) => void
  placeholder?: string
  disabled?: boolean
  containerClassName?: string
}

export const TagInput = ({
  values,
  onAdd,
  onRemove,
  placeholder = 'Add tag...',
  disabled = false,
  containerClassName,
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (disabled) {
      return
    }

    const nextValue = inputValue.trim()
    if (!nextValue) {
      return
    }

    const alreadyExists = values.some(
      (value) => value.toLocaleLowerCase() === nextValue.toLocaleLowerCase(),
    )
    if (alreadyExists) {
      return
    }

    onAdd(nextValue)
    setInputValue('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAdd()
      return
    }

    if (event.key === 'Backspace' && inputValue.length === 0 && values.length > 0) {
      onRemove(values[values.length - 1])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={`${fieldContainer} flex items-center gap-2 ${containerClassName ?? ''}`.trim()}>
        <InputField
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => handleKeyDown(event)}
          placeholder={placeholder}
          disabled={disabled}
          fieldClassName="min-w-[120px] flex-1 border-none bg-transparent p-0"
          inputClassName="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <BasicButton
          params={{
            variant: 'secondary',
            onClick: handleAdd,
            disabled,
            ariaLabel: 'Add tag',
          }}
        >
          + add
        </BasicButton>
      </div>

      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm"
            >
              <span>{value}</span>
              <button
                type="button"
                onClick={() => onRemove(value)}
                disabled={disabled}
                className="text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Remove ${value}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
