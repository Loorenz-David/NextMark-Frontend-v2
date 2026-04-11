import { createContext, useContext } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { FacilityFormPayload, FacilityFormState } from './FacilityForm.types'
import type { FacilityFormWarnings } from './FacilityForm.warnings'

type FacilityFormContextValue = {
  payload: FacilityFormPayload
  formState: FacilityFormState
  setFormState: Dispatch<SetStateAction<FacilityFormState>>
  initialFormRef: RefObject<FacilityFormState | null>
  warnings: FacilityFormWarnings
  handleSave: () => void
}

const FacilityFormContext = createContext<FacilityFormContextValue | null>(null)

export const useFacilityForm = () => {
  const context = useContext(FacilityFormContext)
  if (!context) {
    throw new Error('useFacilityForm must be used within FacilityFormProvider.')
  }
  return context
}

export const useFacilityFormContextValue = () => FacilityFormContext
