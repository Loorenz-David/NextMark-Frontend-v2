import type { StackComponentProps } from '@/shared/stack-manager/types'

import { ClientFormRuleFormLayout } from './ClientFormRuleForm.layout'
import { ClientFormRuleFormProvider } from './ClientFormRuleForm.provider'
import type { ClientFormRuleFormPayload } from './ClientFormRuleForm.types'

export const ClientFormRuleForm = ({ payload }: StackComponentProps<ClientFormRuleFormPayload>) => (
  <ClientFormRuleFormProvider payload={payload ?? { mode: 'create' }}>
    <ClientFormRuleFormLayout />
  </ClientFormRuleFormProvider>
)
