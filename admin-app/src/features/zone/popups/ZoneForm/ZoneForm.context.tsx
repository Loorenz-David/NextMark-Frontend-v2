import { createContext, useContext } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { ZoneFormState } from '@/features/zone/domain/zoneForm.domain'
import type { ZoneState } from '@/features/zone/types'

import type { ZoneFormPayload } from './ZoneForm.types'

type ZoneFormContextValue = {
  payload: ZoneFormPayload
  formState: ZoneFormState
  setFormState: Dispatch<SetStateAction<ZoneFormState>>
  initialFormRef: RefObject<ZoneFormState | null>
  zone: ZoneState | null
  isSubmitting: boolean
  isDeleting: boolean
  handleSave: () => void
  handleDelete?: () => void
  handleCancel: () => void
}

const ZoneFormContext = createContext<ZoneFormContextValue | null>(null)

export const useZoneForm = () => {
  const context = useContext(ZoneFormContext)
  if (!context) {
    throw new Error('useZoneForm must be used within ZoneFormProvider.')
  }
  return context
}

export const useZoneFormContextValue = () => ZoneFormContext
