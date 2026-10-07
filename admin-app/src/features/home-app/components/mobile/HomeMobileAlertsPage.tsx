import { useSyncExternalStore } from 'react'

import { createNotificationsChannel, type NotificationItem } from '@shared-realtime'

import { BellIcon } from '@/assets/icons'
import { adminRealtimeClient } from '@/realtime/client'
import { AdminNotificationItem } from '@/realtime/notifications/AdminNotificationItem'
import { AdminNotificationsAlertToggle } from '@/realtime/notifications/AdminNotificationsAlertToggle'
import { mapNotificationToAdminViewModel } from '@/realtime/notifications/adminNotificationItem.domain'
import { setPendingAdminNotificationLaunchPayload } from '@/realtime/notifications/adminWebPush.store'
import {
  getAdminNotificationSnapshot,
  markAdminNotificationsReadLocally,
  subscribeAdminNotifications,
} from '@/realtime/notifications/notification.store'

const notificationsChannel = createNotificationsChannel(adminRealtimeClient)

const dismissNotification = (notificationId: string) => {
  markAdminNotificationsReadLocally([notificationId])
  notificationsChannel.markRead([notificationId])
}

// Same route a push-notification click takes (AdminNotificationClickBridge).
const openNotification = (notification: NotificationItem) => {
  dismissNotification(notification.notification_id)
  setPendingAdminNotificationLaunchPayload({
    notification_id: notification.notification_id,
    occurred_at: notification.occurred_at,
    target: notification.target,
  })
}

/**
 * The Alerts tab: the same unread list the desktop bell shows, as a full
 * page. Tapping an item opens its order or plan; the dismiss control is
 * always visible here because there is no hover on a phone.
 */
export const HomeMobileAlertsPage = () => {
  const { items, unreadCount } = useSyncExternalStore(
    subscribeAdminNotifications,
    getAdminNotificationSnapshot,
    getAdminNotificationSnapshot,
  )

  const clearAll = () => {
    const ids = items.map((item) => item.notification_id)
    markAdminNotificationsReadLocally(ids)
    notificationsChannel.markRead(ids)
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <header className="admin-glass-divider flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 shadow-[var(--shadow-panel-section)]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-surface-hover px-3 py-3 shadow-[inset_0_1px_0_var(--color-ligth-bg)]">
            <BellIcon className="h-6 w-6 text-[var(--color-muted)]" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold text-[var(--color-text)]">Alerts</div>
            <div className="text-xs text-[var(--color-muted)]">
              {unreadCount === 0 ? 'Nothing unread' : `${unreadCount} unread`}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AdminNotificationsAlertToggle />
          {items.length > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="min-h-11 cursor-pointer rounded-xl px-3 text-sm text-[var(--color-muted)] underline active:bg-surface-hover"
            >
              Clear all
            </button>
          ) : null}
        </div>
      </header>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-2 pb-6 pt-2">
        {items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[var(--color-muted)]">
            No unread notifications.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5 [&_button[aria-label='Mark_notification_as_read']]:opacity-100">
            {items.map((notification) => (
              <AdminNotificationItem
                key={notification.notification_id}
                item={mapNotificationToAdminViewModel(notification)}
                onOpen={() => openNotification(notification)}
                onDismiss={dismissNotification}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
