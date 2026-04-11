import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface OverlayRailProps {
  baseWidth: number
  base: ReactNode
  overlay: ReactNode
  orderOverlay?: ReactNode
  isOrderOverlayOpen: boolean
  hasOverlay: boolean
  orderOverlayWidth: number
  overlayWidth: number
  onPlanLayoutChange?: () => void
}

export function OverlayRail({
  baseWidth,
  base,
  overlay,
  orderOverlay,
  isOrderOverlayOpen,
  hasOverlay,
  orderOverlayWidth,
  overlayWidth,
  onPlanLayoutChange,
}: OverlayRailProps) {
  return (
    <div
      className="relative z-30 h-full min-h-0 shrink-0 overflow-hidden layout-animate"
      style={{
        width: `${isOrderOverlayOpen ? orderOverlayWidth : baseWidth}px`,
        willChange: 'width',
        transition: 'width 220ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      onTransitionEnd={(event) => {
        if (event.propertyName !== 'width') return
        onPlanLayoutChange?.()
      }}
    >
      {base}

      <AnimatePresence mode="sync">
        {orderOverlay && (
          <motion.div
            className="absolute inset-y-0 left-0 z-39 h-full min-h-0 overflow-hidden"
            key="for overlay"
            initial={{ x: 450 }}
            animate={{ x: 0 }}
            exit={{ x: 450 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ width: `${orderOverlayWidth}px` }}
          >
            {orderOverlay}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        {hasOverlay && (
          <motion.div
            className="absolute inset-0 z-40 h-full min-h-0 w-full overflow-hidden"
            key="with-order"
            initial={{ x: overlayWidth }}
            animate={{ x: 0 }}
            exit={{ x: overlayWidth }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {overlay}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
