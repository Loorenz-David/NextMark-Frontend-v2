
import { AnimatePresence } from 'framer-motion'
import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

export const SettingsOverlays = () => {
  const popupManager  = usePopupManager()
  return (
    <AnimatePresence>
      {popupManager.renderStack({})}
    </AnimatePresence>
  )
}