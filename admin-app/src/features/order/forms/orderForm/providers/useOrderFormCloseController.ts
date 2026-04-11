import { useCallback, useEffect, useState } from 'react'

import type { OrderFormCloseController, OrderFormCloseState } from '../state/OrderForm.types'

export const resolveCloseRequest = (hasUnsavedChanges: boolean) => {
  if (hasUnsavedChanges) {
    return { nextCloseState: 'confirming' as const, shouldCloseImmediately: false }
  }

  return { nextCloseState: 'idle' as const, shouldCloseImmediately: true }
}

export const useOrderFormCloseController = ({
  isMobile,
  hasUnsavedChanges,
  onClose,
}: {
  isMobile: boolean
  hasUnsavedChanges: boolean
  onClose?: () => void
}): OrderFormCloseController => {
  const [closeState, setCloseState] = useState<OrderFormCloseState>('idle')

  const finalizeClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  const requestClose = useCallback(() => {
    const next = resolveCloseRequest(hasUnsavedChanges)
    setCloseState(next.nextCloseState)
    if (next.shouldCloseImmediately) {
      finalizeClose()
    }
  }, [finalizeClose, hasUnsavedChanges])

  const cancelClose = useCallback(() => {
    setCloseState('idle')
  }, [])

  const confirmClose = useCallback(() => {
    setCloseState('idle')
    finalizeClose()
  }, [finalizeClose])

  useEffect(() => {
    if (isMobile) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      requestClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobile, requestClose])

  return {
    closeState,
    hasUnsavedChanges,
    requestClose,
    confirmClose,
    cancelClose,
  }
}
