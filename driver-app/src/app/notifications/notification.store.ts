import { createNotificationStore } from '@shared-realtime'

export const driverNotificationStore = createNotificationStore()

export const subscribeDriverNotifications = driverNotificationStore.subscribe
export const getDriverNotificationSnapshot = driverNotificationStore.getSnapshot
export const applyDriverNotificationSnapshot = driverNotificationStore.applySnapshot
export const upsertDriverNotification = driverNotificationStore.upsertNotification
export const markDriverNotificationsReadLocally = driverNotificationStore.markReadLocally
