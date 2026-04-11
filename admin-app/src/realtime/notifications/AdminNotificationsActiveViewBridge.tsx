import { useEffect } from "react";
import { createNotificationsChannel } from "@shared-realtime";
import { adminRealtimeClient } from "@/realtime/client";
import type { PayloadBase } from "@/features/home-route-operations/types/types";
import { useSectionManager } from "@/shared/resource-manager/useResourceManager";
import { useStackActionEntries } from "@/shared/stack-manager/useStackActionEntries";
import {
  getAdminNotificationSnapshot,
  markAdminNotificationsReadLocally,
} from "./notification.store";
import { matchesAdminNotificationTarget } from "./adminNotificationTargets";

const notificationsChannel = createNotificationsChannel(adminRealtimeClient);

const collectActiveNotificationIds = (
  entries: ReturnType<typeof useStackActionEntries>,
  isBaseOpen: boolean = false,
  basePayload?: PayloadBase,
) => {
  const notifications = getAdminNotificationSnapshot().items;
  if (notifications.length === 0) {
    return [];
  }

  return notifications
    .filter((notification) =>
      matchesAdminNotificationTarget(notification, {
        basePayload,
        isBaseOpen,
        sectionEntries: entries,
      }),
    )
    .map((notification) => notification.notification_id);
};

/**
 * Global notifications active-view bridge.
 * Marks notifications as read based on active sections globally.
 * Falls back to section-only matching when base controls are unavailable (non-route-ops workspaces).
 * This component mounts at the home-app level, so it runs for all workspace types.
 */
export function AdminNotificationsActiveViewBridge() {
  const sectionManager = useSectionManager();
  const sectionEntries = useStackActionEntries(sectionManager);

  // Note: useBaseControlls is intentionally NOT called here.
  // The bridge operates on section-only matchings at home-app level.
  // When mounted within route-operations context, route-ops can access full base payload through sectionEntries.
  // When mounted in other workspaces, fallback to section matching only.

  useEffect(() => {
    const matchingIds = collectActiveNotificationIds(
      sectionEntries,
      false, // No base open state available at home-app level
      undefined, // No base payload at home-app level
    );

    if (matchingIds.length === 0) {
      return;
    }

    markAdminNotificationsReadLocally(matchingIds);
    notificationsChannel.markRead(matchingIds);
  }, [sectionEntries]);

  return null;
}
