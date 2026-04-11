import { createContext } from 'react'
import type { ClientFormData, ClientFormMeta, ClientFormStep } from '../domain/clientForm.types'

export type ClientFormContextValue = {
  meta: ClientFormMeta
  data: ClientFormData
  currentStep: ClientFormStep
  isSubmitting: boolean
  setField: <K extends keyof ClientFormData>(key: K, value: ClientFormData[K]) => void
  goToStep: (step: ClientFormStep) => void
  next: () => void
  submit: () => Promise<void>
}

export const ClientFormContext = createContext<ClientFormContextValue | null>(null)
