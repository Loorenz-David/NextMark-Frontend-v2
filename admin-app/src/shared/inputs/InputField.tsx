import type { ChangeEvent, FocusEvent, InputHTMLAttributes, Ref } from 'react'

import { fieldContainer, fieldInput, invalidStyles } from '../../constants/classes'
import type { InputWarningController } from './useInputWarning.hook'

interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'className'> {
  value: string
  onChange: (event:ChangeEvent<HTMLInputElement> )=>void
  onFocus?: (event:FocusEvent<HTMLInputElement> )=>void
  type?: string
  fieldClassName?: string
  inputClassName?: string
  warningController?: InputWarningController
  inputRef?: Ref<HTMLInputElement>
}

export const PLAIN_INPUT_CONTAINER_CLASS = 'w-full'
export const PLAIN_INPUT_CLASS =
  'form-plain-input'



export function InputField({
  value,
  onChange,
  onFocus,
  type = 'text',
  fieldClassName = fieldContainer,
  inputClassName = fieldInput,
  warningController,
  inputRef,
  ...rest
}: InputFieldProps) {
  const isInvalid = Boolean(warningController?.warning.isVisible)
  const containerClasses = [fieldClassName, isInvalid ? invalidStyles : null].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      <input
        {...rest}
        value={value}
        onChange={(event) => {
          warningController?.hideWarning()
          onChange(event)
        }}
        onFocus={(event) =>{
          onFocus?.(event)
        }}
        
        type={type}
        className={inputClassName}
        ref={inputRef}
      />
    </div>
  )
}
