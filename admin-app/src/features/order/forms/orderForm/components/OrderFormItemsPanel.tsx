import { AnimatePresence, motion } from 'framer-motion'

import { BasicButton } from '@/shared/buttons/BasicButton'

import { ItemFormLayout, ItemFormProvider, ItemsOrderPreview } from '../../../item'

import type { OrderFormLayoutModel } from '../OrderForm.layout.model'


type OrderFormItemsPanelProps = {
  model: OrderFormLayoutModel
  compact?: boolean
}

export const OrderFormItemsPanel = ({
  model,
  compact = false,
}: OrderFormItemsPanelProps) => {
  const {
    isItemEditorOpen,
    itemEditorPayload,
    closeItemEditor,
    isLoadingInitialItems,
    visibleItemDrafts,
    openItemCreateForm,
    openItemEditForm,
  } = model

  return (
    <motion.div
      className={`flex min-h-0 overflow-hidden bg-[var(--color-page)] ${
        compact
          ? 'mt-2 h-[420px] w-full shrink-0 rounded-xl border border-[var(--color-border)]/60'
          : 'h-full min-w-0 flex-1 rounded-xl border border-[var(--color-border)]/60'
      }`}
      initial={{ x: 120, opacity: 0 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
          delay: 0.1,
        },
      }}
      exit={{
        opacity: 0,
        x: 100,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
        },
      }}
    >
      <div className="relative h-full w-full min-h-0 rounded-lg border border-[var(--color-muted)]/20 shadow-sm">
        <AnimatePresence mode="wait" initial={false}>
          {isItemEditorOpen && itemEditorPayload ? (
            <motion.div
              key="item-editor"
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full w-full bg-[var(--color-page)] px-3 pt-4"
            >
              <div className="flex h-full w-full min-w-0 flex-col">
                <div className="mb-3 flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {itemEditorPayload.mode == 'controlled' && itemEditorPayload.initialItem
                      ? 'Edit item'
                      : 'Create item'}
                  </p>
                  <BasicButton
                    params={{
                      variant: 'text',
                      onClick: closeItemEditor,
                      ariaLabel: 'Close item form',
                    }}
                  >
                    Back
                  </BasicButton>
                </div>

                <div className="h-full w-full min-h-0 overflow-y-auto scroll-thin">
                  <ItemFormProvider payload={itemEditorPayload} onSuccessClose={closeItemEditor}>
                    <ItemFormLayout />
                  </ItemFormProvider>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="items-preview"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex min-h-0 h-full flex-col   bg-[var(--color-ligth-bg)]"
            >
              {isLoadingInitialItems ? (
                <div className="px-4 py-3 text-xs text-[var(--color-muted)]">Loading items...</div>
              ) : (
                <ItemsOrderPreview
                  controlled={true}
                  items={visibleItemDrafts}
                  onAddItem={openItemCreateForm}
                  onEditItem={openItemEditForm}

                  scrollBody
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
