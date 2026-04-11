import type { ComponentType, ReactNode } from 'react'
import { useMemo } from 'react'

import type { StackComponentProps } from '@/shared/stack-manager/types'
import { ResourcesManagerProvider } from '@/shared/resource-manager/ResourceManagerContext'
import {
  AdminNotificationClickBridge,
  AdminNotificationsActiveViewBridge,
} from '@/realtime/notifications'
import { StackActionManager } from '@/shared/stack-manager/StackActionManager'

import { homePopupRegistry } from '@/features/home-route-operations/registry/homePopups'
import { homeSectionRegistry } from '@/features/home-route-operations/registry/homeSections'

type ExtractPayload<T> = T extends ComponentType<StackComponentProps<infer P>> ? P : never

type HomePopupPayloads = {
  [K in keyof typeof homePopupRegistry]: ExtractPayload<(typeof homePopupRegistry)[K]>
}

/**
 * Global home managers provider.
 * Owns popup and section managers at the home-app level so they are available globally
 * across all workspace types (route-operations, store-pickup, international-shipping).
 * This ensures Cases and global notifications work without depending on workspace-specific runtime state.
 */
export function HomeAppManagersProvider({ children }: { children: ReactNode }) {
  const popupManager = useMemo(
    () =>
      new StackActionManager<HomePopupPayloads>({
        stackRegistry: homePopupRegistry,
      }),
    [],
  )

  const sectionManager = useMemo(
    () =>
      new StackActionManager({
        stackRegistry: homeSectionRegistry,
      }),
    [],
  )

  return (
    <ResourcesManagerProvider
      managers={{
        sectionManager,
        popupManager,
      }}
    >
      <AdminNotificationsActiveViewBridge />
      <AdminNotificationClickBridge />
      {children}
    </ResourcesManagerProvider>
  )
}
