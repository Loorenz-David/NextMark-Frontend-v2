import type { ReactNode } from 'react'
import { useCallback, useEffect } from 'react'

import { DndContext, DragOverlay } from '@dnd-kit/core'

import { ResourcesManagerProvider } from '@/shared/resource-manager/ResourceManagerContext'
import { preloadMapExtras, useMap } from '@/shared/map'
import { useMobile } from '@/app/contexts/MobileContext'

import { homeCollisionDetection } from '../dnd/collisionStrategies'
import type { PayloadBase } from '../types/types'
import { useBaseControlls } from '../hooks/useBaseControlls'
import { useRouteOperationsDndController } from '../hooks/useRouteOperationsDndController'
import { RouteOperationsDragOverlay } from '../components/RouteOperationsDragOverlay'
import { useRouteOperationsFixtureBootstrap } from '../dev/useRouteOperationsFixtureBootstrap'

/**
 * Workspace-specific managers provider for route-operations.
 * Owns only workspace-local runtime state: DnD, map, base controls, and plan-type composition.
 * Global managers (popup, section) are provided by HomeAppManagersProvider at the home-app level.
 * Global notifications bridge is also at home-app level to support all workspace types.
 */
export function HomeRouteOperationsManagersProvider({ children }: { children: ReactNode }) {
  const { isMobile } = useMobile()
  useRouteOperationsFixtureBootstrap()
  const baseControlls = useBaseControlls<PayloadBase>()

  const mapManager = useMap()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Popups are now owned by global manager, so no check for popupManager here.
      // Only handle section close for workspace-local interactions.
      if (event.key === 'Escape') {
        event.preventDefault()
      }
    },
    [],
  )

  useEffect(() => {
    if (!isMobile) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, isMobile])

  useEffect(() => {
    if (isMobile) {
      return
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(() => {
        void preloadMapExtras()
      })

      return () => {
        window.cancelIdleCallback(handle)
      }
    }

    const timeoutId = globalThis.setTimeout(() => {
      void preloadMapExtras()
    }, 300)

    return () => {
      globalThis.clearTimeout(timeoutId)
    }
  }, [isMobile])

  const dndController = useRouteOperationsDndController()

  const {
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
    activeDrag,
    planDropFeedback,
    routeReorderPreview,
    sensors,
  } = dndController || {
    onDragStart: () => {},
    onDragOver: () => {},
    onDragEnd: () => {},
    onDragCancel: () => {},
    activeDrag: null,
    planDropFeedback: null,
    routeReorderPreview: null,
    sensors: [],
  }

  return (
    <ResourcesManagerProvider
      managers={{
        mapManager,
        baseControlls,
        planDropFeedback,
        routeReorderPreview,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={homeCollisionDetection}
        autoScroll={{
          enabled: true,
          threshold: { x: 0.1, y: 0.2 },
          acceleration: 12,
          interval: 8,
        }}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        {children}

        <DragOverlay>
          <RouteOperationsDragOverlay activeDrag={activeDrag} />
        </DragOverlay>
      </DndContext>
    </ResourcesManagerProvider>
  )
}
