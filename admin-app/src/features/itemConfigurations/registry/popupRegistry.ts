import type { StackComponentProps } from '@/shared/stack-manager/types'

import { ItemTypeForm } from '../popups/ItemTypeForm/ItemTypeForm'
import { ItemPropertyForm } from '../popups/ItemPropertyForm/ItemPropertyForm'
import { ItemPositionForm } from '../popups/ItemPositionForm/ItemPositionForm'
import { ItemStateForm } from '../popups/ItemStateForm/ItemStateForm'

export type ItemPopupKey = keyof typeof popupRegistry

type ExtractPayload<T> =
  T extends React.ComponentType<StackComponentProps<infer P>>
    ? P
    : never

export type ItemPopupPayloads = {
  [K in keyof typeof popupRegistry]: ExtractPayload<(typeof popupRegistry)[K]>
}

export const popupRegistry = {
  'item.type.form': ItemTypeForm,
  'item.property.form': ItemPropertyForm,
  'item.position.form': ItemPositionForm,
  'item.state.form': ItemStateForm,
}
