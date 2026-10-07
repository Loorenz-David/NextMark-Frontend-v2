import type { ComponentType, SVGProps } from 'react'

/** Tabs the active workspace fills (plans, orders). */
export type HomeMobileWorkspaceTabId = 'plans' | 'orders'
/** Tabs the shell fills itself, whatever workspace is active. */
export type HomeMobileShellTabId = 'alerts' | 'settings'
export type HomeMobileTabId = HomeMobileWorkspaceTabId | HomeMobileShellTabId

export type HomeMobileTabDescriptor = {
  id: HomeMobileTabId
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

/**
 * Everything that can sit on top of a tab root, in the order the back
 * button peels it away. `popup` is the global popup stack, `sheet` any open
 * bottom sheet, `section` the pushed page stack, `base` the plan workspace
 * panel.
 */
export type HomeMobileLayer = 'popup' | 'sheet' | 'section' | 'base'

export type HomeMobileLayerCounts = {
  popups: number
  sheets: number
  sections: number
  base: boolean
}
