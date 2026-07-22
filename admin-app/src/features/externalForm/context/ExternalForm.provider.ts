import { createElement, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { useExternalFormActions } from '../actions/useExternalFormActions'
import type { ExternalFormStep } from '../domain/externalForm.types'
import { useExternalFormSetter } from '../setters/useExternalFormSetter'
import { useExternalFormWarnings } from '../setters/useExternalFormWarnings'
import { ExternalFormContext } from './ExternalForm.context'
import { useExternalFormRealtime } from '@/realtime/externalForm/useExternalFormRealtime'

type ExternalFormProviderProps = {
  children: ReactNode
}

export const ExternalFormProvider = ({ children }: ExternalFormProviderProps) => {
  const { form, setters } = useExternalFormSetter()
  const warnings = useExternalFormWarnings()

  const [currentStep, setCurrentStep] = useState<ExternalFormStep>('client_info')
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    if (!hasSubmitted) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setHasSubmitted(false)
    }, 10_000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [hasSubmitted])

  const handleRealtimeRequested = useCallback(() => {
    setCurrentStep('client_info')
    setIsFormVisible(true)
    setHasSubmitted(false)
  }, [])

  useExternalFormRealtime({
    onRequested: handleRealtimeRequested,
  })

  const actions = useExternalFormActions(
    form,
    currentStep,
    setCurrentStep,
    warnings,
    () => {
      setIsFormVisible(false)
      setHasSubmitted(true)
      setCurrentStep('client_info')
    },
  )

  return createElement(
    ExternalFormContext.Provider,
    {
      value: {
        form,
        setters,
        currentStep,
        isFormVisible,
        hasSubmitted,
        warnings,
        ...actions,
      },
    },
    children,
  )
}
