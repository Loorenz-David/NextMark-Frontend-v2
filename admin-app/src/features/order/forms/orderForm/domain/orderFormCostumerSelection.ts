import type { Costumer } from '@/features/costumer'
import type { CostumerSelectionSource, OrderFormMode } from '../state/OrderForm.types'

type PendingCostumerAction = 'replace' | 'keep' | 'cancel'

export const shouldPromptCostumerSelection = ({
  mode,
  source,
}: {
  mode: OrderFormMode
  source: CostumerSelectionSource
}) => mode === 'edit' && source !== 'lookup'

export const resolvePendingCostumerAction = ({
  action,
  pendingCostumer,
  pendingCostumerSource,
  currentSelectedCostumer,
  currentSelectedCostumerSource,
}: {
  action: PendingCostumerAction
  pendingCostumer: Costumer | null
  pendingCostumerSource: CostumerSelectionSource | null
  currentSelectedCostumer: Costumer | null
  currentSelectedCostumerSource: CostumerSelectionSource | null
}) => {
  if (!pendingCostumer || action === 'cancel') {
    return {
      selectedCostumer: currentSelectedCostumer,
      selectedCostumerSource: currentSelectedCostumerSource,
      shouldApplySnapshot: false,
    }
  }

  return {
    selectedCostumer: pendingCostumer,
    selectedCostumerSource: pendingCostumerSource ?? 'panel',
    shouldApplySnapshot: action === 'replace',
  }
}
