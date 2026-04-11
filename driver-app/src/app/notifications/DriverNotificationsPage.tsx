import { useMemo, useSyncExternalStore } from 'react'
import { CloseIcon } from '@/assets/icons'
import { createNotificationsChannel } from '@shared-realtime'
import { useWorkspace } from '@/app/providers/workspace.context'
import { driverRealtimeClient } from '@/app/services/realtime'
import { useDriverAppShell } from '@/app/shell'
import { useOpenRouteStopDetail, useRouteExecutionShell } from '@/features/route-execution'
import { useRoutesStore } from '@/features/routes/stores'
import {
  getDriverNotificationSnapshot,
  markDriverNotificationsReadLocally,
  subscribeDriverNotifications,
} from './notification.store'
import { openDriverNotificationTarget } from './driverNotificationTargets'

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const notificationsChannel = createNotificationsChannel(driverRealtimeClient)

export function DriverNotificationsPage() {
  const { closeSlidingPage, openBottomSheet, openOverlay } = useDriverAppShell()
  const openRouteStopDetail = useOpenRouteStopDetail()
  const { store: routeExecutionStore } = useRouteExecutionShell()
  const { workspace } = useWorkspace()
  const { items } = useSyncExternalStore(
    subscribeDriverNotifications,
    getDriverNotificationSnapshot,
    getDriverNotificationSnapshot,
  )
  const routesState = useSyncExternalStore(
    useRoutesStore.subscribe,
    useRoutesStore.getState,
    useRoutesStore.getState,
  )

  const content = useMemo(() => {
    if (items.length === 0) {
      return (
        <div className="rounded-3xl border border-white/10 bg-white/6 px-4 py-5 text-sm text-white/65">
          No unread notifications.
        </div>
      )
    }

    return items.map((notification) => (
      <article
        key={notification.notification_id}
        className="flex flex-col gap-2 rounded-3xl border border-white/8 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.08]"
      >
        <div className="flex items-start justify-between gap-3">
          <button
            className="min-w-0 flex-1 text-left"
            onClick={() => {
              openDriverNotificationTarget(notification, {
                workspaceScopeKey: workspace?.workspaceScopeKey ?? null,
                routeExecutionStore,
                routesState,
                openBottomSheet,
                openOverlay,
                openRouteStopDetail,
                closeSlidingPage,
              })
              markDriverNotificationsReadLocally([notification.notification_id])
              notificationsChannel.markRead([notification.notification_id])
            }}
            type="button"
          >
            <p className="text-sm font-semibold text-white">{notification.title}</p>
            <p className="text-sm text-white/70">{notification.description}</p>
          </button>
          <div className="flex shrink-0 items-start gap-2">
            <span className="text-xs text-white/45">{formatRelativeTime(notification.occurred_at)}</span>
            <button
              aria-label="Dismiss notification"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              onClick={() => {
                markDriverNotificationsReadLocally([notification.notification_id])
                notificationsChannel.markRead([notification.notification_id])
              }}
              type="button"
            >
              <CloseIcon aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {notification.actor_username ? (
          <span className="text-xs font-medium text-white/60">{notification.actor_username}</span>
        ) : null}
      </article>
    ))
  }, [
    closeSlidingPage,
    items,
    openBottomSheet,
    openOverlay,
    openRouteStopDetail,
    routeExecutionStore,
    routesState,
    workspace?.workspaceScopeKey,
  ])

  return (
    <div className="driver-sliding-page-surface__panel-content">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-white">Notifications</h2>
        </div>

        <button
          aria-label="Close notifications"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white"
          onClick={closeSlidingPage}
          type="button"
        >
          <CloseIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-5">
        {content}
      </div>
    </div>
  )
}

function formatRelativeTime(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  const diffSeconds = Math.round((parsed.getTime() - Date.now()) / 1000)
  if (Math.abs(diffSeconds) < 60) {
    return relativeTimeFormatter.format(0, 'second')
  }

  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
    { unit: 'day', seconds: 60 * 60 * 24 },
    { unit: 'hour', seconds: 60 * 60 },
    { unit: 'minute', seconds: 60 },
  ]
  const selected = units.find((entry) => Math.abs(diffSeconds) >= entry.seconds) ?? units[units.length - 1]
  return relativeTimeFormatter.format(Math.round(diffSeconds / selected.seconds), selected.unit)
}
