import { motion } from 'framer-motion'
import { BasicButton } from '@/shared/buttons/BasicButton'
interface PropsConfirmCloseOverlay{
    onConfirm: ()=> void,
    onCancel: ()=> void,
    message?: string
}

export const ConfirmActionPopup = ({ onConfirm, onCancel, message }: PropsConfirmCloseOverlay) => {
  return (
    <motion.div className="absolute inset-0 z-20 flex items-center justify-center popup-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCancel}
    >
      <div className="admin-glass-popover flex max-w-[min(520px,calc(100vw-48px))] flex-col gap-5 rounded-[28px] p-7 shadow-2xl">
        <p className="text-lg text-[var(--color-text)]"> {
        message 
        ? message 
        :"Are you sure you want to perform that action? "
        }
        </p>

        <div className="mt-4 flex gap-4 justify-end">
            <BasicButton params={{
              variant:'primary',
              className:"py-3 px-5",
              onClick:onConfirm
              }}>
                  Yes
              </BasicButton>
          <BasicButton params={{
            variant:'secondary',
            className:"py-3 px-5",
            onClick:onCancel
            }}>
                No
            </BasicButton>
        </div>
      </div>
    </motion.div>
  )
}
