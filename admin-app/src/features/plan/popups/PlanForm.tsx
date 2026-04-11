import type { StackComponentProps } from '@/shared/stack-manager/types'
import type { PopupPayload } from '@/features/plan/forms/planForm/PlanForm.types'
import { PlanFormPopup } from './PlanFormPopup'

export const PlanForm = ({ payload, onClose }: StackComponentProps<PopupPayload>) => (
  <PlanFormPopup payload={payload} onClose={onClose} />
)
