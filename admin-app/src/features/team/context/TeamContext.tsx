import { createContext } from 'react'

import type { StackActionManager } from '@/shared/stack-manager/StackActionManager'

export type TeamContextValue = {
  sectionManager: StackActionManager<Record<string, unknown>>
  popupManager: StackActionManager<Record<string, unknown>>
}

export const TeamContext = createContext<TeamContextValue | null>(null)
