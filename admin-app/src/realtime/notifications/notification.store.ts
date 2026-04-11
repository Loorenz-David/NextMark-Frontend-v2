import { createNotificationStore } from '@shared-realtime'

export const adminNotificationStore = createNotificationStore()

export const subscribeAdminNotifications = adminNotificationStore.subscribe
export const getAdminNotificationSnapshot = adminNotificationStore.getSnapshot
export const applyAdminNotificationSnapshot = adminNotificationStore.applySnapshot
export const upsertAdminNotification = adminNotificationStore.upsertNotification
export const markAdminNotificationsReadLocally = adminNotificationStore.markReadLocally
