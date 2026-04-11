import { useEffect } from "react";

import { useBaseControlls } from "@/shared/resource-manager/useResourceManager";
import type { PayloadBase } from "@/features/home-route-operations/types/types";

import {
  consumePendingAdminNotificationWorkspacePayload,
  getAdminNotificationLaunchSnapshot,
  subscribeAdminNotificationLaunch,
} from "./adminWebPush.store";

export function AdminNotificationWorkspaceBridge() {
  const baseControls = useBaseControlls<PayloadBase>();

  useEffect(() => {
    const processWorkspacePayload = () => {
      const { pendingWorkspacePayload } = getAdminNotificationLaunchSnapshot();
      if (!pendingWorkspacePayload) {
        return;
      }

      const payload = consumePendingAdminNotificationWorkspacePayload();
      if (!payload) {
        return;
      }

      baseControls.openBase({ payload });
    };

    processWorkspacePayload();
    return subscribeAdminNotificationLaunch(processWorkspacePayload);
  }, [baseControls]);

  return null;
}
