import { useEffect, useId, useRef } from 'react'

import { bottomSheetRegistry } from './bottomSheetRegistry'

/**
 * Registers any transient phone layer (a sheet, a pushed sub-page inside a
 * popup) so the shell's back handling closes it before the layer below.
 */
export const useBackLayerRegistration = (open: boolean, onClose: () => void): void => {
  const id = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    bottomSheetRegistry.register(id, () => onCloseRef.current())
    return () => {
      bottomSheetRegistry.unregister(id)
    }
  }, [id, open])
}
