import type { StackComponentProps } from '@/shared/stack-manager/types'
import type { PopupPayload } from '@/features/plan/routeGroup/forms/routeGroupEditForm/RouteGroupEditForm.types'
import { RouteGroupEditFormPopup } from './RouteGroupEditFormPopup'

export const RouteGroupEditForm = ({ payload, onClose }: StackComponentProps<PopupPayload>) => (
  <RouteGroupEditFormPopup payload={payload} onClose={onClose} />
)
