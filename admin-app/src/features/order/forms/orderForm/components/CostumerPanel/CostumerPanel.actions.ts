import { useEffect, useMemo, useRef, useState } from 'react'

import type { Costumer } from '@/features/costumer'
import type { CostumerFormPayload } from '@/features/costumer/forms/costumerForm/state/CostumerForm.types'
import type { ThreeDotMenuOption } from '@/shared/buttons/ThreeDotMenu'
import type { CostumerSelectionRequestResult } from '../../state/OrderForm.types'

import {
  isCostumerPanelFormView,
  resolveCostumerPanelInitialView,
  resolveCostumerPanelViewAfterFormClose,
  resolveCostumerPanelViewForEdit,
  resolveDefaultCostumerLayoutMode,
  resolveExpandedCostumerLayoutMode,
  shouldShowCostumerDetailsMenu,
  shouldShowCostumerSearchBackAction,
} from './CostumerPanel.flows'
import type {
  CostumerPanelNonFormView,
  CostumerPanelView,
  OrderFormCostumerPanelProps,
  UseCostumerPanelActionsResult,
} from './CostumerPanel.types'

export const useCostumerPanelActions = ({
  costumer,
  onSelectCostumer,
  setLayoutMode,
}: Pick<OrderFormCostumerPanelProps, 'costumer' | 'onSelectCostumer' | 'setLayoutMode'>): UseCostumerPanelActionsResult => {
  const [panelView, setPanelView] = useState<CostumerPanelView>(
    () => resolveCostumerPanelInitialView(costumer),
  )
  const previousNonFormViewRef = useRef<CostumerPanelNonFormView>(
    resolveCostumerPanelInitialView(costumer),
  )

  useEffect(() => {
    if (!costumer) {
      setPanelView('search')
      return
    }

    setPanelView('details')
  }, [costumer])

  useEffect(() => {
    if (!isCostumerPanelFormView(panelView)) {
      previousNonFormViewRef.current = panelView
    }
  }, [panelView])

  useEffect(() => {
    if (panelView !== 'form-edit') {
      return
    }

    if (!costumer?.client_id) {
      setPanelView('search')
      setLayoutMode?.(resolveDefaultCostumerLayoutMode())
    }
  }, [costumer?.client_id, panelView, setLayoutMode])

  const handleSelectionResult = (result: CostumerSelectionRequestResult | undefined) => {
    if (result === 'ignored') {
      return
    }

    setPanelView('details')
    setLayoutMode?.(resolveDefaultCostumerLayoutMode())
  }

  const handleStartCreate = () => {
    setPanelView('form-create')
    setLayoutMode?.(resolveExpandedCostumerLayoutMode())
  }

  const handleStartEdit = () => {
    const nextView = resolveCostumerPanelViewForEdit(costumer)
    setPanelView(nextView)
    if (nextView === 'form-edit') {
      setLayoutMode?.(resolveExpandedCostumerLayoutMode())
    }
  }

  const handleStartSearch = () => {
    setPanelView('search')
    setLayoutMode?.(resolveDefaultCostumerLayoutMode())
  }

  const handleBackToDetails = () => {
    if (!costumer) {
      return
    }

    setPanelView('details')
    setLayoutMode?.(resolveDefaultCostumerLayoutMode())
  }

  const handleSearchSelect = (entry: Costumer) => {
    const result = onSelectCostumer?.(entry, 'panel')
    handleSelectionResult(result)
  }

  const handleEmbeddedClose = () => {
    const nextView = resolveCostumerPanelViewAfterFormClose({
      previousView: previousNonFormViewRef.current,
      hasSelectedCostumer: Boolean(costumer),
    })

    setPanelView(nextView)
    setLayoutMode?.(resolveDefaultCostumerLayoutMode())
  }

  const handleEmbeddedSaved = (savedCostumer: Costumer) => {
    const result = onSelectCostumer?.(savedCostumer, 'embedded')
    handleSelectionResult(result)
  }

  const detailsMenuOptions: ThreeDotMenuOption[] = useMemo(
    () => [
      {
        label: 'Change Costumer',
        action: handleStartSearch,
      },
      {
        label: 'Edit Costumer',
        action: handleStartEdit,
      },
    ],
    [handleStartSearch, handleStartEdit],
  )

  const embeddedFormPayload = useMemo<CostumerFormPayload | undefined>(() => {
    if (panelView === 'form-create') {
      return { mode: 'create' }
    }

    if (panelView === 'form-edit' && costumer?.client_id) {
      return {
        mode: 'edit',
        clientId: costumer.client_id,
      }
    }

    return undefined
  }, [costumer?.client_id, panelView])

  return {
    panelView,
    embeddedFormPayload,
    detailsMenuOptions,
    showSearchBackAction: shouldShowCostumerSearchBackAction({
      view: panelView,
      hasSelectedCostumer: Boolean(costumer),
    }),
    showDetailsMenuAction: shouldShowCostumerDetailsMenu(panelView),
    handleStartCreate,
    handleStartEdit,
    handleStartSearch,
    handleBackToDetails,
    handleSearchSelect,
    handleEmbeddedClose,
    handleEmbeddedSaved,
  }
}
