import { useCallback } from 'react'

import { bottomSheetRegistry } from '@/shared/overlays/bottomSheet'
import {
  useBaseControlls,
  usePopupManager,
  useSectionManager,
} from '@/shared/resource-manager/useResourceManager'

import type { HomeMobileLayer } from '../domain/homeMobileShell.types'
import { useHomeMobileShellStore } from '../stores/homeMobileShell.store'

/** One closer per layer kind; the back flow calls it with the resolved target. */
export const useHomeMobileCloseLayerFlow = () => {
  const popupManager = usePopupManager()
  const sectionManager = useSectionManager()
  const baseControlls = useBaseControlls()
  const closeMenu = useHomeMobileShellStore((state) => state.closeMenu)
  const { closeBase } = baseControlls

  return useCallback(
    (layer: HomeMobileLayer) => {
      switch (layer) {
        case 'popup':
          popupManager.close()
          return
        case 'sheet':
          bottomSheetRegistry.closeTop()
          return
        case 'menu':
          closeMenu()
          return
        case 'section':
          sectionManager.close()
          return
        case 'base':
          closeBase()
          return
      }
    },
    [closeBase, closeMenu, popupManager, sectionManager],
  )
}
