import type { ComponentType, SVGProps } from 'react'

export type HomeMobileTabId = 'plans' | 'orders' | 'cases'

export type HomeMobileTabDescriptor = {
  id: HomeMobileTabId
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

/**
 * Everything that can sit on top of a tab root, in the order the back
 * button peels it away. `popup` is the global popup stack, `sheet` any open
 * bottom sheet, `menu` the shell's own menu sheet, `section` the pushed
 * page stack, `base` the plan workspace panel.
 */
export type HomeMobileLayer = 'popup' | 'sheet' | 'menu' | 'section' | 'base'

export type HomeMobileLayerCounts = {
  popups: number
  sheets: number
  menu: boolean
  sections: number
  base: boolean
}
