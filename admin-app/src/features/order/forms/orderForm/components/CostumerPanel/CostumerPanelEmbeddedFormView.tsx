import { CostumerFormEmbedded, type Costumer } from '@/features/costumer'
import type { CostumerFormPayload } from '@/features/costumer/forms/costumerForm/state/CostumerForm.types'

import type { CostumerPanelView } from './CostumerPanel.types'

type CostumerPanelEmbeddedFormViewProps = {
  panelView: Extract<CostumerPanelView, 'form-create' | 'form-edit'>
  payload?: CostumerFormPayload
  onRequestClose: () => void
  onSavedCostumer: (costumer: Costumer) => void
}

export const CostumerPanelEmbeddedFormView = ({
  panelView,
  payload,
  onRequestClose,
  onSavedCostumer,
}: CostumerPanelEmbeddedFormViewProps) => {
  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      <CostumerFormEmbedded
        payload={payload}
        headerTitle={panelView === 'form-create' ? 'Create Costumer' : 'Edit Costumer'}
        headerSubtitle={
          panelView === 'form-create'
            ? 'Add a new costumer profile.'
            : 'Update costumer details.'
        }
        closeLabel="Back"
        onRequestClose={onRequestClose}
        onSavedCostumer={onSavedCostumer}
      />
    </div>
  )
}
