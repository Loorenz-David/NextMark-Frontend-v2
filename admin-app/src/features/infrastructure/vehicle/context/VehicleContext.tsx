import { createContext } from 'react'

import type { StackActionManager } from '@/shared/stack-manager/StackActionManager'

export type VehicleContextValue = {
  sectionManager: StackActionManager<Record<string, unknown>>
  popupManager: StackActionManager<Record<string, unknown>>
}

export const VehicleContext = createContext<VehicleContextValue | null>(null)
