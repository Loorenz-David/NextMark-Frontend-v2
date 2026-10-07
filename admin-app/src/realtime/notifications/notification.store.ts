import { createNotificationStore, type NotificationItem } from '@shared-realtime'

export const adminNotificationStore = createNotificationStore()

type ArrivalListener = (notification: NotificationItem) => void
const arrivalListeners = new Set<ArrivalListener>()

export const subscribeAdminNotifications = adminNotificationStore.subscribe
export const getAdminNotificationSnapshot = adminNotificationStore.getSnapshot
export const applyAdminNotificationSnapshot = adminNotificationStore.applySnapshot
export const markAdminNotificationsReadLocally = adminNotificationStore.markReadLocally

/** Live notification from the server; announces it when it is new. */
export const upsertAdminNotification = (notification: NotificationItem) => {
  const isNew = !adminNotificationStore
    .getSnapshot()
    .items.some((item) => item.notification_id === notification.notification_id)
  adminNotificationStore.upsertNotification(notification)
  if (isNew) {
    arrivalListeners.forEach((listener) => listener(notification))
  }
}

/**
 * Fires only for notifications that just arrived — not for snapshots, which
 * also follow reads, dismissals and reconnects.
 */
export const subscribeAdminNotificationArrivals = (listener: ArrivalListener) => {
  arrivalListeners.add(listener)
  return () => {
    arrivalListeners.delete(listener)
  }
}
