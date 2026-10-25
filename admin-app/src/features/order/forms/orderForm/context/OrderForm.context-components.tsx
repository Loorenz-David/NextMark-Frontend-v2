import type { ReactNode } from 'react'
import { OrderFormActionsContextProvider } from './OrderFormActions.context-components'
import { OrderFormCloseContextProvider } from './OrderFormClose.context-components'
import { OrderFormFormContextProvider } from './OrderFormForm.context-components'
import { OrderFormItemEditorContextProvider } from './OrderFormItemEditor.context-components'
import { OrderFormMetaContextProvider } from './OrderFormMeta.context-components'
import type {
  OrderFormActionsSlice,
  OrderFormCloseSlice,
  OrderFormContextValue,
  OrderFormFormSlice,
  OrderFormItemEditorSlice,
  OrderFormMetaSlice,
} from '../state/OrderForm.types'

export const OrderFormContextProvider = ({
  value,
  children,
}: {
  value: OrderFormContextValue
  children: ReactNode
}) => (
  <OrderFormContextComposer
    formSlice={{
      formState: value.formState,
      warnings: value.warnings,
      formSetters: value.formSetters,
    }}
    actionsSlice={{ actions: value.actions }}
    itemEditorSlice={{ itemEditor: value.itemEditor }}
    metaSlice={{
      meta: value.meta,
      requestSelectCostumer: value.requestSelectCostumer,
      confirmReplaceWithPendingCostumer: value.confirmReplaceWithPendingCostumer,
      confirmKeepSnapshotWithPendingCostumer: value.confirmKeepSnapshotWithPendingCostumer,
      cancelPendingCostumerChange: value.cancelPendingCostumerChange,
    }}
    closeSlice={{ closeController: value.closeController }}
  >
    {children}
  </OrderFormContextComposer>
)

export const OrderFormContextComposer = ({
  formSlice,
  actionsSlice,
  itemEditorSlice,
  metaSlice,
  closeSlice,
  children,
}: {
  formSlice: OrderFormFormSlice
  actionsSlice: OrderFormActionsSlice
  itemEditorSlice: OrderFormItemEditorSlice
  metaSlice: OrderFormMetaSlice
  closeSlice: OrderFormCloseSlice
  children: ReactNode
}) => (
  <OrderFormFormContextProvider value={formSlice}>
    <OrderFormActionsContextProvider value={actionsSlice}>
      <OrderFormItemEditorContextProvider value={itemEditorSlice}>
        <OrderFormMetaContextProvider value={metaSlice}>
          <OrderFormCloseContextProvider value={closeSlice}>{children}</OrderFormCloseContextProvider>
        </OrderFormMetaContextProvider>
      </OrderFormItemEditorContextProvider>
    </OrderFormActionsContextProvider>
  </OrderFormFormContextProvider>
)
