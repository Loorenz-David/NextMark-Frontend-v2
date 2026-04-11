import { ArchiveIcon, DocumentIcon, EditIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { DropdownButton } from "@/shared/buttons/DropdownButton";
import { CounterBadge } from "@/shared/layout/CounterBadge";
import { useOrderDetailHeaderPlanMeta } from "@/features/plan";

import type { OrderDetailHeaderBehavior } from "../../domain/orderDetailPayload.types";
import { useOrderStateRegistry } from "../../domain/useOrderStateRegistry";
import type { Order } from "../../types/order";
import { OrderStateList } from "../lists/OrderStateList";

type OrderDetailHeaderProps = {
  openOrderForm: (payload: {
    clientId?: string;
    mode?: "create" | "edit";
    deliveryPlanId?: number | null;
    routeGroupId?: number | null;
  }) => void;
  openOrderCases: (payload: {
    orderId?: number;
    orderReference: string;
  }) => void;
  onAdvanceOrderState: (clientId: string) => Promise<void>;
  onClose: () => void;
  order: Order | null;
  headerBehavior?: OrderDetailHeaderBehavior | null;
};

export const OrderDetailHeader = ({
  openOrderForm,
  openOrderCases,
  onAdvanceOrderState,
  onClose,
  order,
  headerBehavior = null,
}: OrderDetailHeaderProps) => {
  const registry = useOrderStateRegistry();

  const nextState = registry.getNextStateName(order?.order_state_id);
  const currentStateName =
    order?.order_state_id != null
      ? (registry.getById(order.order_state_id)?.name ?? "Unknown state")
      : "Unknown state";

  return (
    <div className="px-5 pt-4">
      <div className="admin-glass-panel-strong relative overflow-hidden rounded-[28px]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(131,204,185,0.18),transparent_70%)]" />

        <div className="relative flex items-start justify-between gap-4 px-5 py-4">
          <div className="flex flex-col">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] border border-white/12 bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] shadow-[0_12px_28px_rgba(131,204,185,0.1)]">
                <DocumentIcon className="h-[22px] w-[22px] text-[var(--color-primary)]" />
              </div>
              <HeaderTitle order={order} headerBehavior={headerBehavior} />
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <BasicButton
              params={{
                variant: "toolbarSecondary",
                onClick: onClose,
                ariaLabel: "Close order detail",
                className:
                  "min-w-[116px] justify-center px-4 uppercase tracking-[0.24em] text-[0.66rem]",
              }}
            >
              Close
            </BasicButton>

            <BasicButton
              params={{
                variant: "toolbarSecondary",
                onClick: () =>
                  order &&
                  openOrderForm({ mode: "edit", clientId: order.client_id }),
                ariaLabel: "Edit order",
                className: "min-w-[116px] justify-center px-4 py-1.5 text-sm",
              }}
            >
              <EditIcon className="mr-2 h-4 w-4 stroke-[var(--color-text)]" />
              Edit
            </BasicButton>
          </div>
        </div>

        <div className="admin-glass-divider flex flex-wrap items-center gap-3 border-t px-5 py-3">
          <div className="flex min-w-[220px] flex-1 max-w-[270px]">
            <DropdownButton
              label={nextState ? `Mark as ${nextState}` : currentStateName}
              style={{ fontSize: "14px" }}
              variant="lightBlue"
              fullWidth={true}
              disabled={!order}
              onClick={() => {
                if (!order) return;
                void onAdvanceOrderState(order.client_id);
              }}
              className="w-full"
              renderInPortal={true}
              removeFlip={true}
              placement="bottom-start"
              floatingClassName="z-[220]"
            >
              {order ? (
                <OrderStateList order={order} />
              ) : (
                <div className="px-2 py-2 text-sm text-[var(--color-muted)]">
                  Order not available.
                </div>
              )}
            </DropdownButton>
          </div>

          <BasicButton
            params={{
              variant: "toolbarSecondary",
              onClick: () =>
                order?.id &&
                openOrderCases({
                  orderId: order.id,
                  orderReference: order.reference_number ?? "",
                }),
              ariaLabel: "Open order cases",
              className: "min-w-[124px] justify-center px-4 py-1.5 text-sm",
            }}
          >
            <ArchiveIcon className="mr-2 h-4 w-4 stroke-[var(--color-text)]" />
            <div className="flex items-center gap-2">
              <span>Cases</span>
              {order?.open_order_cases != null && order.open_order_cases > 0 ? (
                <CounterBadge
                  text={String(order?.open_order_cases)}
                  bgColor="rgba(255, 213, 3, 0.16)"
                  textColor="rgb(255, 223, 83)"
                />
              ) : null}
            </div>
          </BasicButton>
        </div>
      </div>
    </div>
  );
};

const HeaderTitle = ({
  order,
  headerBehavior,
}: {
  order: Order | null;
  headerBehavior?: OrderDetailHeaderBehavior | null;
}) => {
  const title = `# ${order?.order_scalar_id ?? "reference number missing"}`;
  const shouldRenderPlanMeta = headerBehavior === "order-main-context";
  const planMeta = useOrderDetailHeaderPlanMeta({
    orderId: order?.id ?? null,
    routePlanId: order?.delivery_plan_id ?? null,
    routeGroupId: order?.route_group_id ?? null,
  });

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[0.98rem] font-semibold tracking-tight text-[var(--color-text)]">
          {title}
        </span>
        {order?.external_source ? (
          <span className="inline-flex w-fit rounded-full border border-[var(--color-border-accent)] bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] px-2 py-0.5 text-[0.54rem] font-medium uppercase tracking-[0.2em] text-[var(--color-primary)]">
            {order.external_source}
          </span>
        ) : null}
      </div>
      {shouldRenderPlanMeta ? (
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3  text-[0.72rem] text-[var(--color-muted)]">
          <span className="truncate max-w-[150px]">
            Plan: {planMeta.isUnscheduled ? "Unscheduled" : planMeta.planLabel}
          </span>
          {planMeta.planDateLabel ? (
            <span>Date: {planMeta.planDateLabel}</span>
          ) : null}
          {planMeta.arrivalTimeLabel ? (
            <span>Arrival: {planMeta.arrivalTimeLabel}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
