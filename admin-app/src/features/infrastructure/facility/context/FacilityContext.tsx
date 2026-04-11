import { createContext } from 'react'

import type { StackActionManager } from '@/shared/stack-manager/StackActionManager'

export type FacilityContextValue = {
  sectionManager: StackActionManager<Record<string, unknown>>
  popupManager: StackActionManager<Record<string, unknown>>
}

export const FacilityContext = createContext<FacilityContextValue | null>(null)
