import type { ComponentType } from 'react'
import { motion } from 'framer-motion'

import { useMobile } from '@/app/contexts/MobileContext'
import { DarkOverlay } from '@/shared/layout/DarkOverlay'

type CostumerFormShellProps<TViewProps extends object> = {
  onRequestClose?: () => void
  desktopView: ComponentType<TViewProps>
  mobileView: ComponentType<TViewProps>
  viewProps: TViewProps
}

export const CostumerFormShell = <TViewProps extends object>({
  onRequestClose,
  desktopView: DesktopView,
  mobileView: MobileView,
  viewProps,
}: CostumerFormShellProps<TViewProps>) => {
  const { isMobile } = useMobile()

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100] pointer-events-auto bg-[var(--color-page)] text-[var(--color-text)]">
        <motion.div
          className="flex h-full w-full min-h-0 min-w-0 flex-col"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <MobileView {...viewProps} />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <DarkOverlay onTapAction={onRequestClose} />
      <motion.div
        className="relative z-10 flex h-[min(92vh,820px)] w-[min(640px,96vw)] min-h-0 min-w-0"
        initial={{ opacity: 0, x: 90 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 90 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
      >
        <DesktopView {...viewProps} />
      </motion.div>
    </div>
  )
}
