import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import type { DesktopPlanViewMode } from '../hooks/useHomeDesktopLayout'

interface PlanAreaProps {
  isPlanVisible: boolean
  plan?: ReactNode
  buttonTogglePlan?: ReactNode
  planColumnWidth: number
  planRowHeight: number
  viewMode: DesktopPlanViewMode
  onPlanLayoutChange?: () => void
  onRailTransitionEnd?: () => void
}

export function PlanArea({
  isPlanVisible,
  plan,
  buttonTogglePlan,
  planColumnWidth,
  planRowHeight,
  viewMode,
  onPlanLayoutChange,
  onRailTransitionEnd,
}: PlanAreaProps) {
  if (viewMode === 'split') {
    return (
      <div
        className="relative min-h-0 shrink-0 layout-animate"
        style={{
          height: `${planRowHeight}%`,
          willChange: 'height',
          transition: 'height 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        onTransitionEnd={(event) => {
          if (event.propertyName !== 'height') return
          onRailTransitionEnd?.()
        }}
      >
        { buttonTogglePlan ? (
          <div className="absolute left-0 -top-5 z-20 h-5 w-full border-t border-t-white/10 bg-[rgba(15,23,25,0.78)] backdrop-blur-xl">
            <motion.div
              className="absolute bottom-full  z-20 left-1 "
              initial={{ x: 64 }}
              animate={{ x: 0 }}
              exit={{ x: 64 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {buttonTogglePlan}
            </motion.div>
          </div>
        ) : null}

        <div className="relative h-full min-h-0 overflow-hidden">
          <AnimatePresence>
            {isPlanVisible && (
              <motion.div
                className="h-full min-h-0"
                initial={{ y: 64 }}
                animate={{ y: 0 }}
                exit={{ y: 64 }}
                onAnimationComplete={onPlanLayoutChange}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                {plan}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-20 flex h-full min-h-0 shrink-0 overflow-visible">
      {!isPlanVisible && buttonTogglePlan ? (
        <motion.div
          className="absolute left-0 top-0 z-20 -translate-x-full"
          initial={{ x: 150 }}
          animate={{ x: 0 }}
          exit={{ x: 150 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {buttonTogglePlan}
        </motion.div>
      ) : null}

      <div
        className="relative z-10 flex h-full min-h-0 shrink-0 overflow-hidden layout-animate"
        style={{
          width: planColumnWidth,
          willChange: 'width',
          transition: 'width 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        onTransitionEnd={(event) => {
          if (event.propertyName !== 'width') return
          onRailTransitionEnd?.()
        }}
      >
        <AnimatePresence>
          {isPlanVisible && (
            <motion.div
              className="flex h-full min-h-0 w-full flex-col"
              initial={{ x: 64 }}
              animate={{ x: 0 }}
              exit={{ x: 64 }}
              onAnimationComplete={onPlanLayoutChange}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {plan}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
