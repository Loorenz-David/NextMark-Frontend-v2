import { useCallback, useState } from 'react'

import type { InputWarningState } from './InputWarning'

export interface InputWarningController {
  warning: InputWarningState
  showWarning: (message?: string) => void
  hideWarning: () => void
  setWarningMessage: (message?: string) => void
  validate: (value: unknown) => boolean
  hasWarningActive: ()=> boolean
}

export function useInputWarning(
  initialMessage?: string,
  setValidate?: (value: unknown, setWarningMessage: (value: string)=>void ) => boolean
): InputWarningController {
  const [warning, setWarning] = useState<InputWarningState>({
    message: initialMessage,
    isVisible: false,
  })

  const showWarning = useCallback(
    (message?: string) => {
      setWarning((prev) => ({
        message: message ?? prev.message ?? initialMessage,
        isVisible: true,
      }))
    },
    [initialMessage],
  )

  const hideWarning = useCallback(() => {
    setWarning((prev) => ({
      ...prev,
      isVisible: false,
    }))
  }, [])

  const setWarningMessage = useCallback((message?: string) => {
    setWarning((prev) => ({
      ...prev,
      message,
    }))
  }, [])

  const validate = (value: unknown) =>{
    let outcome: boolean
    if( setValidate ){
      outcome = setValidate( value, setWarningMessage )
    }else{
      outcome = value ? true : false
    }

    if (outcome) hideWarning()
    else showWarning()
    return outcome 
  }
  const hasWarningActive = ()=>{
    return warning.isVisible
  }

  return {
    warning,
    hasWarningActive,
    showWarning,
    hideWarning,
    setWarningMessage,
    validate
  }
}
