import { useSectionManager } from '@/shared/resource-manager/useResourceManager'
import { useEffect } from 'react'

type UseOrderDetailKeyboardFlowParams = {
  isEnabled: boolean
  clientId: string | null
  orderId: number | undefined
  orderReference: string
  isPopupOpen: () => boolean
  isCaseOpen: () => boolean
  onEdit: (clientId: string) => void
  onOpenCases: (payload: { orderId?: number; orderReference: string }) => void
}

export const useOrderDetailKeyboardFlow = ({
  isEnabled,
  clientId,
  orderId,
  orderReference,
  isPopupOpen,
  isCaseOpen,
  onEdit,
  onOpenCases,
}: UseOrderDetailKeyboardFlowParams) => {
  useEffect(() => {
    if (!isEnabled) return

    
    // flow for event listener on keyboard

    return () => {

    }
  }, [clientId, isCaseOpen, isEnabled, isPopupOpen, onEdit, onOpenCases, orderId, orderReference])
}
