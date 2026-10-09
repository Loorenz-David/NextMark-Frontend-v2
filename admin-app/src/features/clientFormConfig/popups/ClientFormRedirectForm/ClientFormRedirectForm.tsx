import type { StackComponentProps } from '@/shared/stack-manager/types'

import { ClientFormRedirectFormLayout } from './ClientFormRedirectForm.layout'
import { ClientFormRedirectFormProvider } from './ClientFormRedirectForm.provider'
import type { ClientFormRedirectFormPayload } from './ClientFormRedirectForm.types'

export const ClientFormRedirectForm = ({
  payload,
}: StackComponentProps<ClientFormRedirectFormPayload>) => (
  <ClientFormRedirectFormProvider payload={payload ?? { mode: 'create' }}>
    <ClientFormRedirectFormLayout />
  </ClientFormRedirectFormProvider>
)
