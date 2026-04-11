import type { StackComponentProps } from '@/shared/stack-manager/types'

import { ItemPositionFormProvider } from './ItemPositionForm.provider'
import { ItemPositionFormLayout } from './ItemPositionForm.layout'
import type { ItemPositionFormPayload } from './ItemPositionForm.types'

export const ItemPositionForm = ({ payload }: StackComponentProps<ItemPositionFormPayload>) => (
  <ItemPositionFormProvider payload={payload ?? { mode: 'create' }}>
    <ItemPositionFormLayout />
  </ItemPositionFormProvider>
)
