import type { StackComponentProps } from '@/shared/stack-manager/types'

import { ItemPropertyFormProvider } from './ItemPropertyForm.provider'
import { ItemPropertyFormLayout } from './ItemPropertyForm.layout'
import type { ItemPropertyFormPayload } from './ItemPropertyForm.types'

export const ItemPropertyForm = ({ payload }: StackComponentProps<ItemPropertyFormPayload>) => (
  <ItemPropertyFormProvider payload={payload ?? { mode: 'create' }}>
    <ItemPropertyFormLayout />
  </ItemPropertyFormProvider>
)
