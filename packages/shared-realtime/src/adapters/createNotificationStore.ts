import type { NotificationItem, NotificationSnapshotPayload } from '../contracts'

type NotificationState = {
  items: NotificationItem[]
  unreadCount: number
}

type Listener = () => void

const compareByOccurredAtDesc = (left: NotificationItem, right: NotificationItem) =>
  right.occurred_at.localeCompare(left.occurred_at)

export function createNotificationStore(initialState?: Partial<NotificationState>) {
  let state: NotificationState = {
    items: initialState?.items ?? [],
    unreadCount: initialState?.unreadCount ?? 0,
  }
  const listeners = new Set<Listener>()

  const notify = () => {
    listeners.forEach((listener) => listener())
  }

  const getSnapshot = () => state

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const applySnapshot = (snapshot: NotificationSnapshotPayload) => {
    state = {
      items: [...snapshot.notifications].sort(compareByOccurredAtDesc),
      unreadCount: snapshot.unread_count,
    }
    notify()
  }

  const upsertNotification = (notification: NotificationItem) => {
    const existed = state.items.some((item) => item.notification_id === notification.notification_id)
    const nextMap = new Map(state.items.map((item) => [item.notification_id, item] as const))
    nextMap.set(notification.notification_id, notification)
    state = {
      items: [...nextMap.values()].sort(compareByOccurredAtDesc),
      unreadCount: state.unreadCount + (existed ? 0 : 1),
    }
    notify()
  }

  const markReadLocally = (notificationIds: string[]) => {
    const ids = new Set(notificationIds)
    const remaining = state.items.filter((item) => !ids.has(item.notification_id))
    const removed = state.items.length - remaining.length
    if (removed === 0) {
      return
    }

    state = {
      items: remaining,
      unreadCount: Math.max(0, state.unreadCount - removed),
    }
    notify()
  }

  return {
    subscribe,
    getSnapshot,
    applySnapshot,
    upsertNotification,
    markReadLocally,
  }
}
