import { createContext, useContext } from 'react'

import type { CostumerFormContextValue } from '../state/CostumerForm.types'

export const CostumerFormContext = createContext<CostumerFormContextValue | null>(null)


export const useCostumerForm = () => {
  const context = useContext(CostumerFormContext)
  if (!context) {
    throw new Error('CostumerFormContext is not available. Wrap with CostumerFormProvider.')
  }
  return context
}
