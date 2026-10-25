import { useViewport } from '@/app/viewport'

import { useHomeMobileBackFlow } from './homeMobileBack.flow'
import { useHomeMobileLayersFlow } from './homeMobileLayers.flow'
import { useHomeMobileCloseLayerFlow } from './useHomeMobileCloseLayer.flow'

/** Give standalone tablet popups, sheets and sections history entries. */
export const useHomeTabletBackFlow = (): void => {
  const { isStandalone, isTablet } = useViewport()
  const layers = useHomeMobileLayersFlow()
  const closeLayer = useHomeMobileCloseLayerFlow()

  useHomeMobileBackFlow({
    enabled: isStandalone && isTablet,
    layers: { ...layers, base: false },
    closeLayer,
  })
}
