import {
  REALTIME_CLIENT_EVENTS,
  REALTIME_SERVER_EVENTS,
  type NotificationItem,
  type NotificationSnapshotPayload,
} from '../contracts'
import type { SharedRealtimeClient } from '../core/client'

const isNotificationItem = (payload: unknown): payload is NotificationItem => {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const candidate = payload as NotificationItem
  return typeof candidate.notification_id === 'string'
    && typeof candidate.title === 'string'
    && typeof candidate.occurred_at === 'string'
}

const isNotificationSnapshot = (payload: unknown): payload is NotificationSnapshotPayload => {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const candidate = payload as NotificationSnapshotPayload
  return Array.isArray(candidate.notifications)
    && typeof candidate.unread_count === 'number'
}

export const createNotificationsChannel = (client: SharedRealtimeClient) => ({
  listen: (
    handlers: {
      onEvent?: (notification: NotificationItem) => void
      onSnapshot?: (snapshot: NotificationSnapshotPayload) => void
    },
  ) => {
    const releases = [
      client.on<NotificationItem>(REALTIME_SERVER_EVENTS.notificationEvent, (payload) => {
        if (handlers.onEvent && isNotificationItem(payload)) {
          handlers.onEvent(payload)
        }
      }),
      client.on<NotificationSnapshotPayload>(REALTIME_SERVER_EVENTS.notificationSnapshot, (payload) => {
        if (handlers.onSnapshot && isNotificationSnapshot(payload)) {
          handlers.onSnapshot(payload)
        }
      }),
    ]

    return () => {
      releases.forEach((release) => release())
    }
  },
  markRead: (notificationIds: string[]) => {
    const ids = notificationIds.filter((notificationId) => typeof notificationId === 'string' && notificationId.trim())
    if (ids.length === 0) {
      return
    }

    client.publish(REALTIME_CLIENT_EVENTS.notificationMarkRead, { notification_ids: ids })
  },
})
