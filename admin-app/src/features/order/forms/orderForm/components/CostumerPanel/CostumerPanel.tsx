import { CostumerPanelEmbeddedFormView } from './CostumerPanelEmbeddedFormView'
import { CostumerPanelDetailsMenuAction } from './CostumerPanelDetailsMenuAction'
import { CostumerPanelDetailsView } from './CostumerPanelDetailsView'
import { CostumerPanelEmptyView } from './CostumerPanelEmptyView'
import {
  isCostumerPanelFormView,
  shouldShowCostumerSearchBar,
} from './CostumerPanel.flows'
import { CostumerPanelSearchBackAction } from './CostumerPanelSearchBackAction'
import { CostumerPanelSearchView } from './CostumerPanelSearchView'
import { CostumerPanelShell } from './CostumerPanelShell'
import { useCostumerPanelActions } from './CostumerPanel.actions'
import type { OrderFormCostumerPanelProps } from './CostumerPanel.types'

export const OrderFormCostumerPanel = ({
  costumer = null,
  onSelectCostumer,
  setLayoutMode,
}: OrderFormCostumerPanelProps) => {
  const actions = useCostumerPanelActions({
    costumer,
    onSelectCostumer,
    setLayoutMode,
  })

  if (isCostumerPanelFormView(actions.panelView)) {
    return (
      <CostumerPanelShell hidePanelTitle>
        <CostumerPanelEmbeddedFormView
          panelView={actions.panelView}
          payload={actions.embeddedFormPayload}
          onRequestClose={actions.handleEmbeddedClose}
          onSavedCostumer={actions.handleEmbeddedSaved}
        />
      </CostumerPanelShell>
    )
  }

  if (shouldShowCostumerSearchBar(actions.panelView)) {
    return (
      <CostumerPanelShell
        headerBoxClassName = {'px-4 pt-3 pb-2'}
        headerAction={
          actions.showSearchBackAction ? (
            <CostumerPanelSearchBackAction onClick={actions.handleBackToDetails} />
          ) : undefined
        }
      >
        <CostumerPanelSearchView
          onSelectCostumer={actions.handleSearchSelect}
          onStartCreate={actions.handleStartCreate}
          selectedCostumerClientId={costumer?.client_id ?? null}
        />
      </CostumerPanelShell>
    )
  }

  if (!costumer) {
    return (
      <CostumerPanelShell>
        <CostumerPanelEmptyView onStartSearch={actions.handleStartSearch} />
      </CostumerPanelShell>
    )
  }

  return (
    <CostumerPanelShell
      headerAction={
        actions.showDetailsMenuAction ? (
          <CostumerPanelDetailsMenuAction options={actions.detailsMenuOptions} />
        ) : undefined
      }
    >
      <CostumerPanelDetailsView costumer={costumer} />
    </CostumerPanelShell>
  )
}
