import type { ReactNode } from 'react'

import type { CostumerFormPayload, CostumerFormSubmitOptions } from './state/CostumerForm.types'
import { CostumerFormProvider } from './providers/CostumerForm.provider'

export const CostumerFormFeature = ({
  payload,
  onClose,
  submitOptions,
  children,
}: {
  payload?: CostumerFormPayload
  onClose?: () => void
  submitOptions?: CostumerFormSubmitOptions
  children: ReactNode
}) => (
  <CostumerFormProvider payload={payload} onClose={onClose} submitOptions={submitOptions}>
    {children}
  </CostumerFormProvider>
)
