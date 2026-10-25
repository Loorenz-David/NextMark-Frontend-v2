import { type ReactNode } from 'react'
import type { CostumerFormContextValue } from '../state/CostumerForm.types'
import { CostumerFormContext } from './CostumerForm.context'

export const CostumerFormContextProvider = ({
  value,
  children,
}: {
  value: CostumerFormContextValue
  children: ReactNode
}) => <CostumerFormContext.Provider value={value}>{children}</CostumerFormContext.Provider>
