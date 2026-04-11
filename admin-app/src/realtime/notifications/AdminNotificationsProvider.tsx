import type { PropsWithChildren } from "react";
import { useEffect, useSyncExternalStore } from "react";
import { createNotificationsChannel } from "@shared-realtime";
import { adminRealtimeClient } from "@/realtime/client";
import { sessionStorage } from "@/features/auth/login/store/sessionStorage";
import {
  applyAdminNotificationSnapshot,
  upsertAdminNotification,
} from "./notification.store";

const notificationsChannel = createNotificationsChannel(adminRealtimeClient);

export function AdminNotificationsProvider({ children }: PropsWithChildren) {
  const session = useSyncExternalStore(
    sessionStorage.subscribe.bind(sessionStorage),
    () => sessionStorage.getSession(),
    () => sessionStorage.getSession(),
  );

  useEffect(() => {
    const socketToken = session?.socketToken ?? null;
    if (!socketToken) {
      applyAdminNotificationSnapshot({ notifications: [], unread_count: 0 });
      return;
    }

    return notificationsChannel.listen({
      onEvent: (notification) => {
        upsertAdminNotification(notification);
      },
      onSnapshot: (snapshot) => {
        applyAdminNotificationSnapshot(snapshot);
      },
    });
  }, [session?.socketToken]);

  return <>{children}</>;
}
