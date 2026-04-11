import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'

import type { StackActionManager } from '../stack-manager/StackActionManager'
import type { BaseControls } from './types'


import type { MapBridge } from '@/shared/map'

export interface isMobileObject {
  isMobile: boolean
  isMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
  setIsMobileViewport: (isMobile: boolean) => void
}

export type PlanDropFeedback = {
  planClientId: string
  movedCount: number
  status: 'success' | 'error'
  token: string
}

export type KnownResourceRegistry = {
  popupManager?: StackActionManager<Record<string, unknown>>
  sectionManager?: StackActionManager<Record<string, unknown>>
  mapManager?: MapBridge
  settingsPopupManager?: StackActionManager<Record<string, unknown>>
  popupConfirmationManager?: StackActionManager<Record<string, unknown>>
  isMobileObject?: isMobileObject
  baseControlls?: BaseControls<unknown>
  planDropFeedback?: PlanDropFeedback | null
  routeReorderPreview?: unknown
}

export type ResourceRegistry<T extends Record<string, unknown> = KnownResourceRegistry> =
  Partial<T> & Record<string, unknown>

export const ResourcesManagerContext = createContext<ResourceRegistry | null>(null)

interface ResourcesManagerProviderProps<T extends Record<string, unknown> = KnownResourceRegistry> {
  managers: ResourceRegistry<T>
  children: ReactNode
}

export function ResourcesManagerProvider<T extends Record<string, unknown> = KnownResourceRegistry>({
  managers,
  children,
}: ResourcesManagerProviderProps<T>) {
  const parentManagers = useContext(ResourcesManagerContext)
  const mergedManagers = useMemo(
    () => ({ ...parentManagers, ...managers }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parentManagers, managers],
  )
  return <ResourcesManagerContext.Provider value={mergedManagers}>{children}</ResourcesManagerContext.Provider>
}
