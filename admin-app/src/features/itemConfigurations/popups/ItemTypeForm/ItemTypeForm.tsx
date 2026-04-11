import type { StackComponentProps } from '@/shared/stack-manager/types'

import { ItemTypeFormProvider } from './ItemTypeForm.provider'
import { ItemTypeFormLayout } from './ItemTypeForm.layout'
import type { ItemTypeFormPayload } from './ItemTypeForm.types'

export const ItemTypeForm = ({ payload }: StackComponentProps<ItemTypeFormPayload>) => (
  <ItemTypeFormProvider payload={payload ?? { mode: 'create' }}>
    <ItemTypeFormLayout />
  </ItemTypeFormProvider>
)
