import { useContext } from 'react'
import { OrderCaseMainContext } from './orderCaseMain.context'

export function useOrderCaseMainContext() {
  const context = useContext(OrderCaseMainContext)

  if (!context) {
    throw new Error('useOrderCaseMainContext must be used within OrderCaseMainContextProvider')
  }

  return context
}
