import type { Costumer } from '@/features/costumer'

import type { DesktopLayoutMode } from '../../views/desktop/OrderFormDesktop.layout'
import type { CostumerPanelNonFormView, CostumerPanelView } from './CostumerPanel.types'

export const resolveCostumerPanelInitialView = (
  costumer?: Costumer | null,
): CostumerPanelNonFormView => (costumer ? 'details' : 'search')

export const resolveCostumerPanelViewForEdit = (
  costumer?: Costumer | null,
): CostumerPanelView => (costumer?.client_id ? 'form-edit' : 'search')

export const resolveCostumerPanelViewAfterFormClose = ({
  previousView,
  hasSelectedCostumer,
}: {
  previousView: CostumerPanelNonFormView
  hasSelectedCostumer: boolean
}): CostumerPanelNonFormView => {
  if (previousView === 'details' && !hasSelectedCostumer) {
    return 'search'
  }

  return previousView
}

export const shouldShowCostumerSearchBar = (view: CostumerPanelView) => view === 'search'

export const shouldShowCostumerSearchBackAction = ({
  view,
  hasSelectedCostumer,
}: {
  view: CostumerPanelView
  hasSelectedCostumer: boolean
}) => view === 'search' && hasSelectedCostumer

export const shouldShowCostumerDetailsMenu = (view: CostumerPanelView) => view === 'details'

export const resolveExpandedCostumerLayoutMode = (): DesktopLayoutMode => 'customer-expanded'
export const resolveDefaultCostumerLayoutMode = (): DesktopLayoutMode => 'default'

export const isCostumerPanelFormView = (
  view: CostumerPanelView,
): view is Extract<CostumerPanelView, 'form-create' | 'form-edit'> =>
  view === 'form-create' || view === 'form-edit'

export const formatCostumerPhone = (costumer: Costumer): string => {
  const primary = costumer.default_primary_phone?.phone
  if (!primary?.number) {
    return '-'
  }

  return `${primary.prefix ?? ''} ${primary.number}`.trim()
}

export const formatCostumerAddress = (costumer: Costumer): string =>
  costumer.default_address?.address?.street_address ?? '-'

export const formatCostumerFullName = (costumer: Costumer): string =>
  `${costumer.first_name} ${costumer.last_name}`.trim()
