import type { ReactNode } from 'react'

import { isHomeMobileTabRootActive } from '../../domain/homeMobileShell.domain'
import { useHomeMobileBackFlow } from '../../flows/homeMobileBack.flow'
import { useHomeMobileLayersFlow } from '../../flows/homeMobileLayers.flow'
import { useHomeMobileCloseLayerFlow } from '../../flows/useHomeMobileCloseLayer.flow'
import { HomeMobileMenuSheet } from './HomeMobileMenuSheet'
import { HomeMobileTabBar } from './HomeMobileTabBar'
import { HomeMobileTopBar } from './HomeMobileTopBar'

type HomeMobileShellProps = {
  /** The active workspace's mobile view: tab roots plus its own page stack. */
  children: ReactNode
}

/**
 * Phone chrome around the active workspace: top bar, tab bar, menu sheet,
 * and the back-button integration. Pushed pages and popups render above
 * all of it, so the chrome is only reachable at a tab root.
 */
export const HomeMobileShell = ({ children }: HomeMobileShellProps) => {
  const layers = useHomeMobileLayersFlow()
  const closeLayer = useHomeMobileCloseLayerFlow()
  useHomeMobileBackFlow({ enabled: true, layers, closeLayer })
  const isRootActive = isHomeMobileTabRootActive(layers)

  return (
    <div className="admin-mobile-shell relative flex h-dvh w-full flex-col overflow-hidden bg-[var(--color-page)] text-[var(--color-text)]">
      <HomeMobileTopBar inert={!isRootActive} />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      <HomeMobileTabBar inert={!isRootActive} />
      <HomeMobileMenuSheet />
    </div>
  )
}
