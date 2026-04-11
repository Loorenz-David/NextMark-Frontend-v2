import { useMemo, useState } from 'react'

import { ThunderIcon } from '@/assets/icons'
import { RouteGroupEditFormFeature } from '@/features/plan/routeGroup/forms/routeGroupEditForm/RouteGroupEditForm'
import { RouteGroupEditFormDesktopLayout } from '@/features/plan/routeGroup/forms/routeGroupEditForm/views/desktop/RouteGroupEditFormDesktop.layout'
import { RouteGroupEditFormMobileLayout } from '@/features/plan/routeGroup/forms/routeGroupEditForm/views/mobile/RouteGroupEditFormMobile.layout'
import { useRouteGroupEditFormContextData } from '@/features/plan/routeGroup/forms/routeGroupEditForm/RouteGroupEditFormContextData'
import type { PopupPayload } from '@/features/plan/routeGroup/forms/routeGroupEditForm/RouteGroupEditForm.types'
import type { RouteGroupEditFormViewProps } from '@/features/plan/routeGroup/forms/routeGroupEditForm/views/RouteGroupEditForm.views.types'
import {
  FeaturePopupClosePrompt,
  useFeaturePopupCloseController,
} from '@/shared/popups/featurePopup'
import type { StackComponentProps } from '@/shared/stack-manager/types'
import { RouteGroupEditFormShell } from './RouteGroupEditFormShell'

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

export const RouteGroupEditFormPopup = ({
  payload,
  onClose,
}: StackComponentProps<PopupPayload>) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { selectedRouteSolution } = useRouteGroupEditFormContextData(payload)

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


  const viewProps: RouteGroupEditFormViewProps = {
    header: {
      title: "Edit route optimization",
      variant: selectedVariantLabel,
      optimizationDate: optimizationDate
    },
    onClose: closeController.requestClose,
  }

  return (
    <>
      <RouteGroupEditFormFeature
        payload={payload}
        onSuccessClose={closeController.confirmClose}
        onUnsavedChangesChange={setHasUnsavedChanges}
      >
        <RouteGroupEditFormShell<RouteGroupEditFormViewProps>
          onRequestClose={closeController.requestClose}
          desktopView={RouteGroupEditFormDesktopLayout}
          mobileView={RouteGroupEditFormMobileLayout}
          viewProps={viewProps}
        />
      </RouteGroupEditFormFeature>
      <FeaturePopupClosePrompt controller={closeController} />
    </>
  )
}
