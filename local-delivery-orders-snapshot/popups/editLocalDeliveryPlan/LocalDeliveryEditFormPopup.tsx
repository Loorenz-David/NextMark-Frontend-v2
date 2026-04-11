import { useMemo, useState } from 'react'

import { ThunderIcon } from '@/assets/icons'
import { LocalDeliveryEditFormFeature } from '@/features/local-delivery-orders/forms/localDeliveryEditForm/LocalDeliveryEditForm'
import { LocalDeliveryEditFormDesktopLayout } from '@/features/local-delivery-orders/forms/localDeliveryEditForm/views/desktop/LocalDeliveryEditFormDesktop.layout'
import { LocalDeliveryEditFormMobileLayout } from '@/features/local-delivery-orders/forms/localDeliveryEditForm/views/mobile/LocalDeliveryEditFormMobile.layout'
import { useLocalDeliveryEditFormContextData } from '@/features/local-delivery-orders/forms/localDeliveryEditForm/LocalDeliveryEditFormContextData'
import type { PopupPayload } from '@/features/local-delivery-orders/forms/localDeliveryEditForm/LocalDeliveryEditForm.types'
import type { LocalDeliveryEditFormViewProps } from '@/features/local-delivery-orders/forms/localDeliveryEditForm/views/LocalDeliveryEditForm.views.types'
import {
  FeaturePopupClosePrompt,
  useFeaturePopupCloseController,
} from '@/shared/popups/featurePopup'
import type { StackComponentProps } from '@/shared/stack-manager/types'
import { LocalDeliveryEditFormShell } from './LocalDeliveryEditFormShell'

const isOptimized = (value?: string | null) =>
  value === 'optimize' || value === 'partial optimize'

const formatOptimizationDate = (value?: string | null) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const LocalDeliveryEditFormPopup = ({
  payload,
  onClose,
}: StackComponentProps<PopupPayload>) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { selectedRouteSolution } = useLocalDeliveryEditFormContextData(payload)

  const selectedVariantLabel = useMemo(() => {
    if (selectedRouteSolution?.label) return selectedRouteSolution.label
    if (selectedRouteSolution?.id) return `Variant ${selectedRouteSolution.id}`
    return null
  }, [selectedRouteSolution?.id, selectedRouteSolution?.label])

  const optimizationDate = useMemo(() => {
    if (!isOptimized(selectedRouteSolution?.is_optimized)) return null
    return formatOptimizationDate(selectedRouteSolution?.created_at)
  }, [selectedRouteSolution?.created_at, selectedRouteSolution?.is_optimized])

  const closeController = useFeaturePopupCloseController({
    hasUnsavedChanges,
    onClose,
  })


  const viewProps: LocalDeliveryEditFormViewProps = {
    header: {
      title: "Edit route optimization",
      variant: selectedVariantLabel,
      optimizationDate: optimizationDate
    },
    onClose: closeController.requestClose,
  }

  return (
    <>
      <LocalDeliveryEditFormFeature
        payload={payload}
        onSuccessClose={closeController.confirmClose}
        onUnsavedChangesChange={setHasUnsavedChanges}
      >
        <LocalDeliveryEditFormShell<LocalDeliveryEditFormViewProps>
          onRequestClose={closeController.requestClose}
          desktopView={LocalDeliveryEditFormDesktopLayout}
          mobileView={LocalDeliveryEditFormMobileLayout}
          viewProps={viewProps}
        />
      </LocalDeliveryEditFormFeature>
      <FeaturePopupClosePrompt controller={closeController} />
    </>
  )
}
