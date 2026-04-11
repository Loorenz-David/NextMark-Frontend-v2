import type { OrderBatchSelectionPayload } from '../types/orderBatchSelection'
import type { useOrderSelectionStore } from '../store/orderSelection.store'

type OrderSelectionState = ReturnType<typeof useOrderSelectionStore.getState>

const dedupePositiveIds = (ids: Array<number | null | undefined>) =>
  Array.from(new Set(ids.filter((id): id is number => Number.isFinite(id) && (id ?? 0) > 0)))

const resolveSelectionModeTargetIds = (state: OrderSelectionState): number[] => {
  if (state.resolvedSelection.count > 0 && state.loadedSelectionIds.length > 0) {
    return dedupePositiveIds(
      state.loadedSelectionIds.filter((id) => !state.excludedServerIds.includes(id)),
    )
  }

  const manualSelected = state.manualSelectedServerIds.filter(
    (id) => !state.excludedServerIds.includes(id),
  )
  const loadedSelected = state.loadedSelectionIds.filter(
    (id) => !state.excludedServerIds.includes(id),
  )

  return dedupePositiveIds([...manualSelected, ...loadedSelected])
}

export const resolveBatchTargetOrderIds = (
  selection: OrderBatchSelectionPayload,
  selectionState: OrderSelectionState,
): number[] => {
  if (selection.source === 'selection') {
    return resolveSelectionModeTargetIds(selectionState)
  }

  // Group/single batch moves should patch by payload manual ids.
  return dedupePositiveIds(selection.manual_order_ids)
}

export const resolveSelectionAuthorityBatchCount = (selectionState: OrderSelectionState): number => {
  if (selectionState.resolvedSelection.count > 0) {
    return selectionState.resolvedSelection.count
  }

  const manualCount = selectionState.manualSelectedServerIds.filter(
    (id) => !selectionState.excludedServerIds.includes(id),
  ).length
  const estimatedSnapshots = selectionState.selectAllSnapshots.reduce(
    (total, snapshot) => total + (snapshot.estimatedCount ?? 0),
    0,
  )

  return manualCount + estimatedSnapshots
}
