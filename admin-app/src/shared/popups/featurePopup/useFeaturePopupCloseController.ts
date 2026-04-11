import { useCallback, useRef, useState } from 'react'

import type { PopupCloseController, UseFeaturePopupCloseControllerInput } from './types'

const resolveCanClose = async (canClose?: () => boolean | Promise<boolean>) => {
  if (!canClose) return true
  try {
    const result = canClose()
    return typeof result === 'boolean' ? result : await result
  } catch {
    return false
  }
}

export const useFeaturePopupCloseController = ({
  hasUnsavedChanges,
  onClose,
  canClose,
}: UseFeaturePopupCloseControllerInput): PopupCloseController => {
  const [closeState, setCloseState] = useState<'idle' | 'confirming'>('idle')
  const closingRef = useRef(false)

  const closeNow = useCallback(async () => {
    if (closingRef.current) return
    closingRef.current = true
    try {
      const allowed = await resolveCanClose(canClose)
      if (!allowed) {
        setCloseState('idle')
        return
      }
      setCloseState('idle')
      onClose?.()
    } finally {
      closingRef.current = false
    }
  }, [canClose, onClose])

  const requestClose = useCallback(() => {
    if (closingRef.current) return

    if (hasUnsavedChanges) {
      setCloseState('confirming')
      return
    }

    void closeNow()
  }, [closeNow, hasUnsavedChanges])

  const confirmClose = useCallback(async () => {
    if (closingRef.current) return
    await closeNow()
  }, [closeNow])

  const cancelClose = useCallback(() => {
    if (closingRef.current) return
    setCloseState('idle')
  }, [])

  return {
    closeState,
    hasUnsavedChanges,
    requestClose,
    confirmClose,
    cancelClose,
  }
}
