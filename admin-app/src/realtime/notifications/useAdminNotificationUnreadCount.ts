import { useSyncExternalStore } from "react";

import {
  getAdminNotificationSnapshot,
  subscribeAdminNotifications,
} from "./notification.store";

const getUnreadCount = () => getAdminNotificationSnapshot().unreadCount;

/** Unread notifications, for surfaces that hint at them without the bell. */
export const useAdminNotificationUnreadCount = (): number =>
  useSyncExternalStore(subscribeAdminNotifications, getUnreadCount, getUnreadCount);
