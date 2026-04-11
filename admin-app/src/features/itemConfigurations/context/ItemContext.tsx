import { createContext } from 'react'

import type { StackActionManager } from '@/shared/stack-manager/StackActionManager'

export type ItemContextValue = {
  sectionManager: StackActionManager<Record<string, unknown>>
  popupManager: StackActionManager<Record<string, unknown>>
}

export const ItemContext = createContext<ItemContextValue | null>(null)
