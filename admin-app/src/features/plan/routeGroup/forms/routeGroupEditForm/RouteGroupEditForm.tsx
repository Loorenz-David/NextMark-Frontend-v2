import type { ReactNode } from 'react'

import { RouteGroupEditFormForm } from './components'
import { RouteGroupEditFormProvider } from './RouteGroupEditForm.provider'
import type { PopupPayload } from './RouteGroupEditForm.types'

export const RouteGroupEditFormFeature = ({
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
    <RouteGroupEditFormProvider
      payload={payload}
      onSuccessClose={onSuccessClose}
      onUnsavedChangesChange={onUnsavedChangesChange}
    >
      {children ?? <RouteGroupEditFormForm />}
    </RouteGroupEditFormProvider>
  )
}
