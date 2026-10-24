
import { useOrderFormActionsSlice } from './OrderFormActions.context'
import { useOrderFormCloseSlice } from './OrderFormClose.context'
import { useOrderFormFormSlice } from './OrderFormForm.context'
import { useOrderFormItemEditorSlice } from './OrderFormItemEditor.context'
import { useOrderFormMetaSlice } from './OrderFormMeta.context'
import type { OrderFormContextValue } from '../state/OrderForm.types'



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
