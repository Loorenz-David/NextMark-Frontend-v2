import { useEffect, useMemo, useRef } from 'react'

import { useOrderBatchSelectionController } from '../controllers/orderBatchSelection.controller'
import {
  useExcludedOrderServerIds,
  useHasSelectionIntent,
  useManualSelectedOrderServerIds,
  useOrderBatchSelectionPayload,
  useOrderSelectAllSnapshots,
  useOrderSelectionActions,
  useOrderSelectionMode,
} from '../store/orderSelectionHooks.store'

const RESOLVE_DEBOUNCE_MS = 220

export const useOrderBatchSelectionResolveFlow = () => {
  const isSelectionMode = useOrderSelectionMode()
  const hasSelectionIntent = useHasSelectionIntent()
  const snapshots = useOrderSelectAllSnapshots()
  const manualSelectedServerIds = useManualSelectedOrderServerIds()
  const excludedServerIds = useExcludedOrderServerIds()
  const selectionPayload = useOrderBatchSelectionPayload()
  const { resolveSelection } = useOrderBatchSelectionController()
  const { setResolvedSelection, clearResolvedSelection } = useOrderSelectionActions()

  const payloadKey = useMemo(
    () => JSON.stringify(selectionPayload),
    [selectionPayload],
  )

  const requestSeqRef = useRef(0)
  const inFlightKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isSelectionMode || !hasSelectionIntent) {
      clearResolvedSelection()
      inFlightKeyRef.current = null
      return
    }

    if (snapshots.length === 0) {
      const manualCount = manualSelectedServerIds.filter(
        (id) => !excludedServerIds.includes(id),
      ).length
      setResolvedSelection({
        count: manualCount,
        signature: `manual:${manualSelectedServerIds.join(',')}:${excludedServerIds.join(',')}`,
        isLoading: false,
      })
      inFlightKeyRef.current = null
      return
    }

    const currentRequest = requestSeqRef.current + 1
    requestSeqRef.current = currentRequest

    const timer = window.setTimeout(async () => {
      if (inFlightKeyRef.current === payloadKey) {
        return
      }

      inFlightKeyRef.current = payloadKey
      setResolvedSelection({ isLoading: true })

      const response = await resolveSelection(selectionPayload)
      if (requestSeqRef.current !== currentRequest) {
        return
      }

      if (!response) {
        inFlightKeyRef.current = null
        setResolvedSelection({ isLoading: false })
        return
      }

      setResolvedSelection({
        count: response.resolved_count ?? 0,
        signature: response.signature ?? null,
        isLoading: false,
      })
      inFlightKeyRef.current = null
    }, RESOLVE_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    clearResolvedSelection,
    excludedServerIds,
    hasSelectionIntent,
    isSelectionMode,
    manualSelectedServerIds,
    payloadKey,
    resolveSelection,
    selectionPayload,
    setResolvedSelection,
    snapshots.length,
  ])
}
