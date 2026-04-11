import type { NotificationItem } from "@shared-realtime";
import type { NotificationTarget } from "@shared-realtime";
import type { PayloadBase } from "@/features/home-route-operations/types/types";
import type { useOrderActions } from "@/features/order/actions/order.actions";
import type { useCaseOrderActions } from "@/features/orderCase/pages/order/order.actions";
import type { useStackActionEntries } from "@/shared/stack-manager/useStackActionEntries";

type AdminNotificationOpenDependencies = {
  openLocalDeliveryWorkspace: (payload: PayloadBase) => void;
  openOrderDetail: ReturnType<typeof useOrderActions>["openOrderDetail"];
  openCaseDetails: ReturnType<typeof useCaseOrderActions>["openCaseDetails"];
};

type AdminNotificationMatchDependencies = {
  isBaseOpen: boolean;
  basePayload?: PayloadBase;
  sectionEntries: ReturnType<typeof useStackActionEntries>;
};

const toPositiveInt = (value: unknown): number | null => {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }

    return Math.trunc(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }

    return Math.trunc(parsed);
  }

  return null;
};

type OpenNotificationTargetPayload = {
  occurred_at: string;
  target: NotificationTarget;
};

export const openAdminNotificationTargetPayload = (
  payload: OpenNotificationTargetPayload,
  dependencies: AdminNotificationOpenDependencies,
) => {
  const targetOrderId = toPositiveInt(payload.target.params.orderId);
  const targetOrderCaseId = toPositiveInt(payload.target.params.orderCaseId);
  const targetPlanId = toPositiveInt(payload.target.params.planId);

  if (payload.target.kind === "order_detail" && targetOrderId != null) {
    dependencies.openOrderDetail(
      {
        serverId: targetOrderId,
        mode: "view",
        freshAfter: payload.occurred_at,
      },
      {
        pageClass: "bg-[var(--color-muted)]/10",
        borderLeft: "rgb(var(--color-light-blue-r),0.7)",
      },
    );
    return;
  }

  if (
    (payload.target.kind === "order_case_detail" ||
      payload.target.kind === "order_case_chat") &&
    (targetOrderCaseId != null ||
      typeof payload.target.params.orderCaseClientId === "string")
  ) {
    dependencies.openCaseDetails({
      orderCaseClientId: payload.target.params.orderCaseClientId,
      orderCaseId: targetOrderCaseId ?? undefined,
      freshAfter: payload.occurred_at,
    });
    return;
  }

  if (
    payload.target.kind === "local_delivery_workspace" &&
    targetPlanId != null
  ) {
    dependencies.openLocalDeliveryWorkspace({
      planId: targetPlanId,
      freshAfter: payload.occurred_at,
    });
  }
};

export const openAdminNotificationTarget = (
  notification: NotificationItem,
  dependencies: AdminNotificationOpenDependencies,
) => {
  openAdminNotificationTargetPayload(
    { occurred_at: notification.occurred_at, target: notification.target },
    dependencies,
  );
};

export const matchesAdminNotificationTarget = (
  notification: NotificationItem,
  dependencies: AdminNotificationMatchDependencies,
) => {
  const { basePayload, isBaseOpen, sectionEntries } = dependencies;
  const { target } = notification;
  const targetOrderId = toPositiveInt(target.params.orderId);
  const targetOrderCaseId = toPositiveInt(target.params.orderCaseId);
  const targetPlanId = toPositiveInt(target.params.planId);

  if (target.kind === "order_detail") {
    if (targetOrderId == null) {
      return false;
    }

    return sectionEntries.some((entry) => {
      if (entry.isClosing || entry.key !== "order.details") {
        return false;
      }

      const payload = entry.payload as
        | { serverId?: number | string }
        | undefined;
      return toPositiveInt(payload?.serverId) === targetOrderId;
    });
  }

  if (
    target.kind === "order_case_detail" ||
    target.kind === "order_case_chat"
  ) {
    return sectionEntries.some((entry) => {
      if (entry.isClosing || entry.key !== "orderCase.details") {
        return false;
      }

      const payload = entry.payload as
        | { orderCaseId?: number | string; orderCaseClientId?: string }
        | undefined;
      return (
        (typeof target.params.orderCaseClientId === "string" &&
          payload?.orderCaseClientId === target.params.orderCaseClientId) ||
        (targetOrderCaseId != null &&
          toPositiveInt(payload?.orderCaseId) === targetOrderCaseId)
      );
    });
  }

  if (target.kind === "local_delivery_workspace") {
    if (!isBaseOpen || !basePayload) {
      return false;
    }

    return toPositiveInt(basePayload.planId) === targetPlanId;
  }

  return false;
};
