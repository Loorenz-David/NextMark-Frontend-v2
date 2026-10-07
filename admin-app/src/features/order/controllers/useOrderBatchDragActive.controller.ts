import { useContext } from 'react'

import { ResourcesManagerContext } from '@/shared/resource-manager/ResourceManagerContext'

import { isOrderBatchActiveDrag } from '../domain/orderBatchDrag.domain'

/**
 * True while a selection-mode batch drag is in flight, so selected order cards
 * can step out of the list the way the grabbed card does.
 *
 * Reads the context optionally: order lists also render outside the
 * route-operations workspace (store pickup, international shipping), where no
 * drag state is published. Subscribing here — not to dnd-kit's context —
 * re-renders on drag start/end only, not on every pointer move.
 */
export const useOrderBatchDragActive = (): boolean => {
  const resources = useContext(ResourcesManagerContext)
  return isOrderBatchActiveDrag(resources?.routeOperationsActiveDrag)
}
