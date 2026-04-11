import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import {
  createNotificationsChannel,
} from '@shared-realtime'
import { useSession } from '@/app/providers/session.context'
import { useWorkspace } from '@/app/providers/workspace.context'
import { driverRealtimeClient } from '@/app/services/realtime'
import { useDriverAppShell } from '@/app/shell'
import {
  selectSelectedRoute,
  useRoutesSelectionStore,
  useRoutesStore,
} from '@/features/routes'
import {
  applyDriverNotificationSnapshot,
  getDriverNotificationSnapshot,
  markDriverNotificationsReadLocally,
  upsertDriverNotification,
} from './notification.store'
import { matchesDriverNotificationTarget } from './driverNotificationTargets'

const notificationsChannel = createNotificationsChannel(driverRealtimeClient)

export function DriverNotificationsProvider({ children }: PropsWithChildren) {
  const { session, sessionState } = useSession()
  const { workspace } = useWorkspace()
  const { store } = useDriverAppShell()
  const routesState = useRoutesStore((state) => state)
  const routesSelectionState = useRoutesSelectionStore((state) => state)
  const selectedRoute = useMemo(
    () => selectSelectedRoute(routesSelectionState, routesState),
    [routesSelectionState, routesState],
  )
  const shellState = useSyncExternalStore(store.subscribe, store.getState, store.getState)

  useEffect(() => {
    const socketToken = session?.socketToken ?? null
    const teamId = workspace?.teamId ?? null
    const canExecuteRoutes = workspace?.capabilities.canExecuteRoutes ?? false
    if (sessionState !== 'authenticated' || !socketToken || !teamId || !canExecuteRoutes) {
      applyDriverNotificationSnapshot({ notifications: [], unread_count: 0 })
      return
    }

    return notificationsChannel.listen({
      onEvent: (notification) => {
        upsertDriverNotification(notification)
      },
      onSnapshot: (snapshot) => {
        applyDriverNotificationSnapshot(snapshot)
      },
    })
  }, [
    session?.socketToken,
    sessionState,
    workspace?.capabilities.canExecuteRoutes,
    workspace?.teamId,
  ])

  useEffect(() => {
    const activeRouteId = selectedRoute?.id ?? null
    const activeOverlay = shellState.overlayStack.at(-1) ?? null
    if (activeRouteId == null) {
      return
    }

    const matchingIds = getDriverNotificationSnapshot()
      .items
      .filter((notification) => matchesDriverNotificationTarget(notification, {
        activeRouteId,
        overlayEntry: activeOverlay,
      }))
      .map((notification) => notification.notification_id)

    if (matchingIds.length === 0) {
      return
    }

    markDriverNotificationsReadLocally(matchingIds)
    notificationsChannel.markRead(matchingIds)
  }, [selectedRoute?.id, shellState.overlayStack, shellState.bottomSheetStack])

  return <>{children}</>
}
