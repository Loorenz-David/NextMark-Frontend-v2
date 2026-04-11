import { createContext, useContext, type ReactNode } from 'react'

import type { CostumerFormContextValue } from '../state/CostumerForm.types'

const CostumerFormContext = createContext<CostumerFormContextValue | null>(null)

export const CostumerFormContextProvider = ({
  value,
  children,
}: {
  value: CostumerFormContextValue
  children: ReactNode
}) => <CostumerFormContext.Provider value={value}>{children}</CostumerFormContext.Provider>

export const useCostumerForm = () => {
  const context = useContext(CostumerFormContext)
  if (!context) {
    throw new Error('CostumerFormContext is not available. Wrap with CostumerFormProvider.')
  }
  return context
}
