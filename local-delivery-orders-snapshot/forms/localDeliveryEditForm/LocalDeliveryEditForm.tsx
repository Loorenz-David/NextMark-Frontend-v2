import type { ReactNode } from 'react'

import { LocalDeliveryEditFormForm } from './components'
import { LocalDeliveryEditFormProvider } from './LocalDeliveryEditForm.provider'
import type { PopupPayload } from './LocalDeliveryEditForm.types'

export const LocalDeliveryEditFormFeature = ({
  payload,
  onSuccessClose,
  onUnsavedChangesChange,
  children,
}: {
  payload?: PopupPayload
  onSuccessClose?: () => void | Promise<void>
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void
  children?: ReactNode
}) => {
  return (
    <LocalDeliveryEditFormProvider
      payload={payload}
      onSuccessClose={onSuccessClose}
      onUnsavedChangesChange={onUnsavedChangesChange}
    >
      {children ?? <LocalDeliveryEditFormForm />}
    </LocalDeliveryEditFormProvider>
  )
}
