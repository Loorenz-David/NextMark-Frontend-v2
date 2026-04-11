import { useMemo, useState } from 'react'

import type { StackComponentProps } from '@/shared/stack-manager/types'
import {
  FeaturePopupBody,
  FeaturePopupClosePrompt,
  FeaturePopupHeader,
  FeaturePopupShell,
  useFeaturePopupCloseController,
} from '@/shared/popups/featurePopup'

import { PlanFormFeature } from '@/features/plan/forms/planForm/PlanForm'
import type { PopupPayload, PlanFormMode } from '@/features/plan/forms/planForm/PlanForm.types'
import { InfoHover } from '@/shared/layout/InfoHover'
import { PLAN_MAIN_HEADER_INFO } from '@/features/plan/info/planMainHeader.info'

const resolveHeaderModel = (mode: PlanFormMode) => {
  if (mode === 'create') {
    return {
      title: (
        <span className="inline-flex items-center gap-2">
          <span>Create a Plan</span>
          <InfoHover content={PLAN_MAIN_HEADER_INFO} />
        </span>
      ),
      subtitle: 'choose between the plan types.',
    }
  }

  return {
    title: (
      <span className="inline-flex items-center gap-2">
        <span>Edit plan</span>
        <InfoHover content={PLAN_MAIN_HEADER_INFO} />
      </span>
    ),
    subtitle: 'update plan.',
  }
}

export const PlanFormPopup = ({ payload, onClose }: StackComponentProps<PopupPayload>) => {
  const mode = payload?.mode ?? 'create'
  const header = useMemo(() => resolveHeaderModel(mode), [mode])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const closeController = useFeaturePopupCloseController({
    hasUnsavedChanges,
    onClose,
  })

  return (
    <>
      <FeaturePopupShell onRequestClose={closeController.requestClose} size="mdNoHeight" variant="center">
        <FeaturePopupHeader
          title={header.title}
          subtitle={header.subtitle}
          onClose={closeController.requestClose}
        />
        <FeaturePopupBody >
          <PlanFormFeature
            payload={payload}
            onSuccessClose={closeController.confirmClose}
            onUnsavedChangesChange={setHasUnsavedChanges}
          />
        </FeaturePopupBody>
      </FeaturePopupShell>
      <FeaturePopupClosePrompt controller={closeController} />
    </>
  )
}
