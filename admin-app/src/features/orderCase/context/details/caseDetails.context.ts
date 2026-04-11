import { createContext, useContext } from 'react'
import type { OrderCase } from '../../types'
import type { useDetailsActions } from '../../pages/details/details.actions'





export type DetailsCaseContextValue = {
    orderCase: OrderCase | null
    detailsActions: ReturnType<typeof useDetailsActions>
    currentUserId: number | null
    isRefreshing: boolean
}

export const DetailsCaseContext = createContext<DetailsCaseContextValue | null>(null)

export const useCaseDetailsContext = () => {
  const context = useContext(DetailsCaseContext)
  if (!context) {
    throw new Error('DetailsCaseContext must be used within DetailsCaseProvider')
  }
  return context
}
