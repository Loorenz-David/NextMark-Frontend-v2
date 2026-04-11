import type { ReactNode } from 'react'

import { OrderFormActionsContextProvider, useOrderFormActionsSlice } from './OrderFormActions.context'
import { OrderFormCloseContextProvider, useOrderFormCloseSlice } from './OrderFormClose.context'
import { OrderFormFormContextProvider, useOrderFormFormSlice } from './OrderFormForm.context'
import { OrderFormItemEditorContextProvider, useOrderFormItemEditorSlice } from './OrderFormItemEditor.context'
import { OrderFormMetaContextProvider, useOrderFormMetaSlice } from './OrderFormMeta.context'
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

export const useOrderForm = (): OrderFormContextValue => {
  const { formState, warnings, formSetters } = useOrderFormFormSlice()
  const { actions } = useOrderFormActionsSlice()
  const { itemEditor } = useOrderFormItemEditorSlice()
  const {
    meta,
    requestSelectCostumer,
    confirmReplaceWithPendingCostumer,
    confirmKeepSnapshotWithPendingCostumer,
    cancelPendingCostumerChange,
  } = useOrderFormMetaSlice()
  const { closeController } = useOrderFormCloseSlice()

  return {
    formState,
    warnings,
    formSetters,
    actions,
    itemEditor,
    meta,
    requestSelectCostumer,
    confirmReplaceWithPendingCostumer,
    confirmKeepSnapshotWithPendingCostumer,
    cancelPendingCostumerChange,
    closeController,
  }
}
