
import { AnimatePresence } from 'framer-motion'
import { usePopupManager } from '@/shared/resource-manager/useResourceManager'
import { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'

export const HomeOverlays = () => {
  const popupManager  = usePopupManager()
  useStackActionEntries(popupManager)
 
  return (
    <AnimatePresence>
      {popupManager.renderStack({})}
    </AnimatePresence>
  )
}