import type { StackComponentProps } from '@/shared/stack-manager/types'

import { ItemStateFormProvider } from './ItemStateForm.provider'
import { ItemStateFormLayout } from './ItemStateForm.layout'
import type { ItemStateFormPayload } from './ItemStateForm.types'

export const ItemStateForm = ({ payload }: StackComponentProps<ItemStateFormPayload>) => (
  <ItemStateFormProvider payload={payload ?? { mode: 'create' }}>
    <ItemStateFormLayout />
  </ItemStateFormProvider>
)
