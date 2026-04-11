import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { useCostumerFormActions } from '../controllers/useCostumerFormSubmit.controller'
import type {
  Costumer,
  CostumerAddress,
  CostumerOperatingHours,
  CostumerPhone,
} from '../../../dto/costumer.dto'
import type { useCostumerFormSetters } from './costumerForm.setters'
import type { useCostumerFormWarnings } from './CostumerForm.warnings'

export type CostumerFormMode = 'create' | 'edit'
export type CostumerFormCloseState = 'idle' | 'confirming'

export type CostumerFormState = {
  first_name: string
  last_name: string
  email: string
  addresses: CostumerAddress[]
  phones: CostumerPhone[]
  operating_hours: CostumerOperatingHours[]
}

export type CostumerFormPayload = {
  mode?: CostumerFormMode
  clientId?: string
}

export type CostumerFormSubmitOptions = {
  closeOnSuccess?: boolean
  popupKeyToClose?: string
  onSavedCostumer?: (costumer: Costumer) => void
}

export type CostumerFormWarnings = ReturnType<typeof useCostumerFormWarnings>
export type CostumerFormSetters = ReturnType<typeof useCostumerFormSetters>
export type CostumerFormActions = ReturnType<typeof useCostumerFormActions>

export type CostumerFormMeta = {
  mode: CostumerFormMode
  costumer: Costumer | null
  initialFormRef: RefObject<CostumerFormState | null>
}

export type CostumerFormCloseController = {
  closeState: CostumerFormCloseState
  hasUnsavedChanges: boolean
  requestClose: () => void
  confirmClose: () => void
  cancelClose: () => void
}

export type CostumerFormContextValue = {
  formState: CostumerFormState
  setFormState: Dispatch<SetStateAction<CostumerFormState>>
  warnings: CostumerFormWarnings
  formSetters: CostumerFormSetters
  actions: CostumerFormActions
  meta: CostumerFormMeta
  closeController: CostumerFormCloseController
}
