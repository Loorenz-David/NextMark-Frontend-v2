import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ConfirmActionButtonProps = {
  onConfirm: () => void
  deleteContent: React.ReactNode
  confirmContent: React.ReactNode
  deleteClassName?: string
  confirmClassName?: string
  confirmOverLay?:string
  duration?: number
  stopPropagation?: boolean
}

export const ConfirmActionButton = ({
  onConfirm,
  deleteContent,
  confirmContent,
  deleteClassName = '',
  confirmClassName = '',
  confirmOverLay = 'bg-red-700',
  duration = 2500,
  stopPropagation = true,
}: ConfirmActionButtonProps) => {
    const [confirming, setConfirming] = useState(false)
    const [canConfirm, setCanConfirm] = useState(false)
    const handleDeleteClick = (e: React.MouseEvent) => {
        if (stopPropagation) e.stopPropagation()

        setConfirming(true)
        setCanConfirm(false)

        setTimeout(()=>{
            setCanConfirm(true)
        }, 400)

        setTimeout(() => {
        setConfirming(false)
        }, duration)
    }

  const handleConfirmClick = (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation()
    if (!canConfirm) return
    onConfirm()
    setCanConfirm(false)
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!confirming ? (
        <motion.div
          key="delete"
          role="button"
          className={`cursor-pointer ${deleteClassName}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={handleDeleteClick}
        >
          {deleteContent}
        </motion.div>
      ) : (
        <motion.div
          key="confirm"
          role="button"
          className={`relative overflow-hidden cursor-pointer select-none ${confirmClassName}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={handleConfirmClick}
        >
          {/* Progress Overlay */}
          <motion.span
            className={`absolute inset-0 select-none ${confirmOverLay}`}
            style={{ transformOrigin: 'left center' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: duration / 1000 - 0.3, ease: 'linear' }}
          />

          <div className="relative z-10">
            {confirmContent}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}