import type {
  HomeMobileLayer,
  HomeMobileLayerCounts,
  HomeMobileShellTabId,
  HomeMobileTabId,
} from './homeMobileShell.types'

export const DEFAULT_HOME_MOBILE_TAB: HomeMobileTabId = 'plans'

const SHELL_TABS: readonly HomeMobileShellTabId[] = ['alerts', 'settings']

export const isHomeMobileShellTab = (tab: HomeMobileTabId): tab is HomeMobileShellTabId =>
  (SHELL_TABS as readonly string[]).includes(tab)

/** Highest priority first: what the back button closes when several layers are open. */
export const HOME_MOBILE_BACK_PRIORITY: readonly HomeMobileLayer[] = [
  'popup',
  'sheet',
  'section',
  'base',
]

export const EMPTY_HOME_MOBILE_LAYERS: HomeMobileLayerCounts = {
  popups: 0,
  sheets: 0,
  sections: 0,
  base: false,
}

const layerCount = (layers: HomeMobileLayerCounts, layer: HomeMobileLayer): number => {
  switch (layer) {
    case 'popup':
      return layers.popups
    case 'sheet':
      return layers.sheets
    case 'section':
      return layers.sections
    case 'base':
      return layers.base ? 1 : 0
  }
}

/** Total number of layers above the tab root; one history entry per layer. */
export const countHomeMobileLayers = (layers: HomeMobileLayerCounts): number =>
  HOME_MOBILE_BACK_PRIORITY.reduce((total, layer) => total + layerCount(layers, layer), 0)

/** The layer a back gesture should close, or null when only the tab root is showing. */
export const resolveHomeMobileBackTarget = (
  layers: HomeMobileLayerCounts,
): HomeMobileLayer | null =>
  HOME_MOBILE_BACK_PRIORITY.find((layer) => layerCount(layers, layer) > 0) ?? null

/** Tab roots are interactive only while nothing full-screen covers them. */
export const isHomeMobileTabRootActive = (layers: HomeMobileLayerCounts): boolean =>
  layers.sections === 0 && !layers.base && layers.popups === 0
