import type { StackComponentProps } from '@/shared/stack-manager/types'

import { ClientFormMediaFormLayout } from './ClientFormMediaForm.layout'
import { ClientFormMediaFormProvider } from './ClientFormMediaForm.provider'
import type { ClientFormMediaFormPayload } from './ClientFormMediaForm.types'

export const ClientFormMediaForm = ({
  payload,
}: StackComponentProps<ClientFormMediaFormPayload>) => (
  <ClientFormMediaFormProvider payload={payload ?? { mode: 'create' }}>
    <ClientFormMediaFormLayout />
  </ClientFormMediaFormProvider>
)
