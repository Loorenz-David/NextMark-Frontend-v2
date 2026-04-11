import { createContext } from 'react'
import { useContext } from 'react'

import type { ExternalFormData, ExternalFormStep } from '../domain/externalForm.types'
import type { ExternalFormSetters } from '../setters/useExternalFormSetter'
import type { useExternalFormWarnings } from '../setters/useExternalFormWarnings'

export type ExternalFormContextType = {
  form: ExternalFormData
  setters: ExternalFormSetters
  currentStep: ExternalFormStep
  isFormVisible: boolean
  hasSubmitted: boolean
  warnings: ReturnType<typeof useExternalFormWarnings>
  goToStep: (step: ExternalFormStep) => void
  next: () => void
  submit: () => void
}

export const ExternalFormContext = createContext<ExternalFormContextType | null>(null)


export const useExternalForm = () => {
  const ctx = useContext(ExternalFormContext)

  if (!ctx) {
    throw new Error('ExternalFormProvider missing')
  }

  return ctx
}
