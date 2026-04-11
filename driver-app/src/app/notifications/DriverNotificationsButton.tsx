import { useSyncExternalStore } from 'react'
import { BellIcon } from '@/assets/icons'
import { useDriverAppShell } from '@/app/shell'
import {
  getDriverNotificationSnapshot,
  subscribeDriverNotifications,
} from './notification.store'

export function DriverNotificationsButton() {
  const { openSlidingPage } = useDriverAppShell()
  const { unreadCount } = useSyncExternalStore(
    subscribeDriverNotifications,
    getDriverNotificationSnapshot,
    getDriverNotificationSnapshot,
  )

  return (
    <button
      aria-label="Open notifications"
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--bg-app-color))]/40 shadow-[0_18px_36px_rgba(31,26,19,0.14)] backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02]"
      onClick={() => openSlidingPage('notifications', undefined)}
      type="button"
    >
      <BellIcon className="h-5 w-5 text-[rgb(var(--bg-strong-light))]" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#f26a63] px-1 text-[10px] font-semibold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </button>
  )
}
