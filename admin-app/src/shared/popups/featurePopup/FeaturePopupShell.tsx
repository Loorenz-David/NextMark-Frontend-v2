import { useEffect } from 'react'
import { motion } from 'framer-motion'

import { useMobile } from '@/app/contexts/MobileContext'
import { DarkOverlay } from '@/shared/layout/DarkOverlay'

import type { FeaturePopupShellProps } from './types'

const sizeClassMap = {
  sm: 'w-[min(520px,96vw)] h-[min(86vh,760px)]',
  md: 'w-[min(600px,96vw)] h-[min(88vh,820px)]',
  mdNoHeight:'w-[min(600px,96vw)]',
  lg: 'w-[min(860px,96vw)] h-[min(90vh,900px)]',
  full: 'w-[min(1140px,98vw)] h-[min(92vh,960px)]',
} as const

export const FeaturePopupShell = ({
  children,
  onRequestClose,
  size = 'md',
  variant = 'center',
}: FeaturePopupShellProps) => {
  const { isMobile } = useMobile()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      onRequestClose()
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [onRequestClose])

  if (isMobile || variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-[100] pointer-events-auto bg-[var(--color-page)] text-[var(--color-text)]">
        <motion.div
          className="flex h-full w-full min-h-0 min-w-0 flex-col"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </div>
    )
  }

  const isSide = variant === 'side'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <DarkOverlay onTapAction={onRequestClose} />
      <motion.div
        className={`relative z-10 flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl bg-[var(--color-page)] text-[var(--color-text)] shadow-xl ${sizeClassMap[size]}`}
        initial={isSide ? { opacity: 0, x: 84 } : { opacity: 0, y: 18, scale: 0.98 }}
        animate={isSide ? { opacity: 1, x: 0 } : { opacity: 1, y: 0, scale: 1 }}
        exit={isSide ? { opacity: 0, x: 84 } : { opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  )
}
