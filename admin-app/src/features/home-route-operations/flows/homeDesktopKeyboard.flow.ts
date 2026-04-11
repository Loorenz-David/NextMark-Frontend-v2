import { useEffect } from 'react'

type HomeDesktopKeyboardFlowParams = {
  isEnabled: boolean
  isPopupOpen: boolean
  onTogglePlan: () => void
  closeAllSections: () => void
}

export const shouldTogglePlanFromKeydown = (event: Pick<KeyboardEvent, 'key'>, isPopupOpen: boolean) => {
  if (isPopupOpen) return false
  return event.key.toLowerCase() === 'p'
}

export const useHomeDesktopKeyboardFlow = ({
  isEnabled,
  isPopupOpen,
  onTogglePlan,
  closeAllSections,
}: HomeDesktopKeyboardFlowParams) => {
  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!shouldTogglePlanFromKeydown(event, isPopupOpen)) return
      closeAllSections()
      onTogglePlan()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeAllSections, isEnabled, isPopupOpen, onTogglePlan])
}
