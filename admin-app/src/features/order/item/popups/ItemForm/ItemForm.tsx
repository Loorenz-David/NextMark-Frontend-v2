import type { StackComponentProps } from '@/shared/stack-manager/types'
import { useState } from 'react'
import {
  FeaturePopupBody,
  FeaturePopupClosePrompt,
  FeaturePopupHeader,
  FeaturePopupShell,
  useFeaturePopupCloseController,
} from '@/shared/popups/featurePopup'

import type { ItemPopupPayload } from '../../types'

import { ItemFormLayout } from './ItemForm.layout'
import { ItemFormProvider } from './ItemForm.provider'

export const ItemForm = ({ payload, onClose }: StackComponentProps<ItemPopupPayload>) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const closeController = useFeaturePopupCloseController({
    hasUnsavedChanges,
    onClose,
  })

  if (!payload) {
    throw new Error('ItemForm payload is missing.')
  }

  const isEdit = payload.mode === 'autonomous' && Boolean(payload.itemId)
  const headerLabel = isEdit ? 'Edit Item' : 'Create Item'

  return (
    <>
      <FeaturePopupShell onRequestClose={closeController.requestClose} size="md" variant="center">
        <FeaturePopupHeader
          title={headerLabel}
          onClose={closeController.requestClose}
        />
        <FeaturePopupBody className="px-3 py-5">
          <ItemFormProvider
            payload={payload}
            onSuccessClose={closeController.confirmClose}
            onUnsavedChangesChange={setHasUnsavedChanges}
          >
            <ItemFormLayout />
          </ItemFormProvider>
        </FeaturePopupBody>
      </FeaturePopupShell>
      <FeaturePopupClosePrompt controller={closeController} />
    </>
  )
}
