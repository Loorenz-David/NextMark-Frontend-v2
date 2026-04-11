import type { StackComponentProps } from '@/shared/stack-manager/types'

import { UserEdit } from '../popups/UserEdit/UserEdit'

export type PopupKey = keyof typeof popupRegistry

type ExtractPayload<T> = T extends React.ComponentType<StackComponentProps<infer P>>
  ? P
  : never

export type UserPopupPayloads = {
  [K in keyof typeof popupRegistry]: ExtractPayload<(typeof popupRegistry)[K]>
}

export const popupRegistry = {
  'user.edit': UserEdit,
}
