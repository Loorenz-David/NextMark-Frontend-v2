import { createElement, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'

import { useExternalFormActions } from '../actions/useExternalFormActions'
import type { ExternalFormStep } from '../domain/externalForm.types'
import { resolveExternalFormTargetUserId } from '../flows/externalForm.flow'
import { useExternalFormSetter } from '../setters/useExternalFormSetter'
import { useExternalFormWarnings } from '../setters/useExternalFormWarnings'
import { ExternalFormContext } from './ExternalForm.context'
import { sessionStorage } from '@/features/auth/login/store/sessionStorage'
import {
  type ExternalFormRequestedPayload,
} from '@/realtime/externalForm/externalForm.realtime'
import { useExternalFormRealtime } from '@/realtime/externalForm/useExternalFormRealtime'

type ExternalFormProviderProps = {
  children: ReactNode
}

export const ExternalFormProvider = ({ children }: ExternalFormProviderProps) => {
  const { form, setters } = useExternalFormSetter()
  const warnings = useExternalFormWarnings()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const session = sessionStorage.getSession()
  const targetUserId = resolveExternalFormTargetUserId({
    pathname: location.pathname,
    searchParams,
    session,
  })

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

  const handleRealtimeRequested = useCallback((_payload: ExternalFormRequestedPayload) => {
    setCurrentStep('client_info')
    setIsFormVisible(true)
    setHasSubmitted(false)
  }, [])

  useExternalFormRealtime({
    userId: targetUserId,
    onRequested: handleRealtimeRequested,
  })

  const actions = useExternalFormActions(
    form,
    currentStep,
    setCurrentStep,
    warnings,
    targetUserId,
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
