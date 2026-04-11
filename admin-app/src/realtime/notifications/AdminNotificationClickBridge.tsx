import { useEffect } from "react";

import { useHomeApp } from "@/features/home-app/providers/HomeAppProvider";
import { useOrderActions } from "@/features/order";
import { useCaseOrderActions } from "@/features/orderCase/pages/order/order.actions";

import {
  consumePendingAdminNotificationLaunchPayload,
  getAdminNotificationLaunchSnapshot,
  setPendingAdminNotificationWorkspacePayload,
  subscribeAdminNotificationLaunch,
} from "./adminWebPush.store";
import { openAdminNotificationTargetPayload } from "./adminNotificationTargets";

export function AdminNotificationClickBridge() {
  const { setActiveWorkspace } = useHomeApp();
  const { openOrderDetail } = useOrderActions();
  const { openCaseDetails } = useCaseOrderActions();

  useEffect(() => {
    const processLaunchPayload = () => {
      const { pendingLaunchPayload } = getAdminNotificationLaunchSnapshot();
      if (!pendingLaunchPayload) {
        return;
      }

      const launchPayload = consumePendingAdminNotificationLaunchPayload();
      if (!launchPayload) {
        return;
      }

      openAdminNotificationTargetPayload(
        {
          occurred_at: launchPayload.occurred_at,
          target: launchPayload.target,
        },
        {
          openOrderDetail,
          openCaseDetails,
          openLocalDeliveryWorkspace: (payload) => {
            if (typeof payload.planId !== "number") {
              return;
            }

            setActiveWorkspace("route-operations");
            setPendingAdminNotificationWorkspacePayload({
              planId: payload.planId,
              freshAfter: payload.freshAfter ?? null,
            });
          },
        },
      );
    };

    processLaunchPayload();
    return subscribeAdminNotificationLaunch(processLaunchPayload);
  }, [openCaseDetails, openOrderDetail, setActiveWorkspace]);

  return null;
}
