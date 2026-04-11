import type { PropsWithChildren } from 'react'

import { useOrderCaseMainFlow } from '../../flows/orderCasePages.flow'
import { useCaseMainActions } from '../../pages/main/main.actions'
import { CaseMainContext } from './caseMain.context'

type CaseMainProviderProps = PropsWithChildren<{
  onClose?: () => void
}>

export const CaseMainProvider = ({ children, onClose }: CaseMainProviderProps) => {
  const caseMainActions = useCaseMainActions({ onClose })
  const { cases, casesStats, query } = useOrderCaseMainFlow()
  
  const value = {
    cases,
    casesStats,
    query,
    caseMainActions,
  }

  return <CaseMainContext.Provider value={value}>{children}</CaseMainContext.Provider>
}
