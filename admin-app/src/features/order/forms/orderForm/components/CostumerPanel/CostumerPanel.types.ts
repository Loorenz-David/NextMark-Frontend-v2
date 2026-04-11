import type { Costumer } from '@/features/costumer'
import type { CostumerFormPayload } from '@/features/costumer/forms/costumerForm/state/CostumerForm.types'
import type { ThreeDotMenuOption } from '@/shared/buttons/ThreeDotMenu'

import type { DesktopLayoutMode } from '../../views/desktop/OrderFormDesktop.layout'
import type {
  CostumerSelectionRequestResult,
  CostumerSelectionSource,
} from '../../state/OrderForm.types'

export type CostumerPanelView = 'search' | 'details' | 'form-create' | 'form-edit'
export type CostumerPanelNonFormView = Extract<CostumerPanelView, 'search' | 'details'>

export type OrderFormCostumerPanelProps = {
  costumer?: Costumer | null
  onSelectCostumer?: (
    costumer: Costumer,
    source?: CostumerSelectionSource,
  ) => CostumerSelectionRequestResult
  layoutMode?: DesktopLayoutMode
  setLayoutMode?: (value: DesktopLayoutMode) => void
}

export type UseCostumerPanelActionsResult = {
  panelView: CostumerPanelView
  embeddedFormPayload?: CostumerFormPayload
  detailsMenuOptions: ThreeDotMenuOption[]
  showSearchBackAction: boolean
  showDetailsMenuAction: boolean
  handleStartCreate: () => void
  handleStartEdit: () => void
  handleStartSearch: () => void
  handleBackToDetails: () => void
  handleSearchSelect: (costumer: Costumer) => void
  handleEmbeddedClose: () => void
  handleEmbeddedSaved: (costumer: Costumer) => void
}
