import { motion } from 'framer-motion'

import { BasicButton } from '@/shared/buttons/BasicButton'

const buildPromptLabel = (pendingCostumerName?: string) => {
  if (!pendingCostumerName) {
    return 'You selected a different costumer. Replace order snapshot details with this costumer data?'
  }

  return `You selected ${pendingCostumerName}. Replace order snapshot details with this costumer data?`
}

type OrderFormCostumerChangePromptProps = {
  pendingCostumerName?: string
  onReplace: () => void
  onKeep: () => void
  onCancel: () => void
}

export const OrderFormCostumerChangePrompt = ({
  pendingCostumerName,
  onReplace,
  onKeep,
  onCancel,
}: OrderFormCostumerChangePromptProps) => (
  <motion.div
    className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    onClick={onCancel}
  >
    <motion.div
      className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-page)] p-5 shadow-xl"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <div className="flex justify-between items-end">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Costumer Changed</h3>
         <BasicButton
          params={{
            variant: 'text',
            onClick: onCancel,
            className: '',
            ariaLabel: 'Cancel costumer change',
            style:{borderColor:'var(--color-border-accent)'}
          }}
        >
          Cancel
        </BasicButton>
      </div>  
      <p className="mt-5 text-sm text-[var(--color-muted)]">{buildPromptLabel(pendingCostumerName)}</p>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
       
        <BasicButton
          params={{
            variant: 'secondary',
            onClick: onKeep,
            className: 'px-3 py-2',
            ariaLabel: 'Keep current order snapshot',
          }}
        >
          Keep Current Snapshot
        </BasicButton>
        <BasicButton
          params={{
            variant: 'primary',
            onClick: onReplace,
            className: 'px-3 py-2',
            ariaLabel: 'Replace order snapshot details',
          }}
        >
          Replace With Costumer
        </BasicButton>
      </div>
    </motion.div>
  </motion.div>
)
