import { ArchiveIcon, DocumentIcon, EditIcon } from "@/assets/icons";
import { PageBackButton } from "@/shared/buttons/PageBackButton";
import { DropdownButton } from "@/shared/buttons/DropdownButton";
import { CounterBadge } from "@/shared/layout/CounterBadge";

import type { OrderDetailHeaderBehavior } from "../../domain/orderDetailPayload.types";
import { useOrderStateRegistry } from "../../domain/useOrderStateRegistry";
import type { Order } from "../../types/order";
import { OrderStateList } from "../lists/OrderStateList";
import { OrderDetailHeaderTitle } from "./OrderDetailHeader";

type OrderDetailHeaderMobileProps = {
  openOrderForm: (payload: {
    clientId?: string;
    mode?: "create" | "edit";
    deliveryPlanId?: number | null;
    routeGroupId?: number | null;
  }) => void;
  openOrderCases: (payload: { orderId?: number; orderReference: string }) => void;
  onAdvanceOrderState: (clientId: string) => Promise<void>;
  onClose: () => void;
  order: Order | null;
  headerBehavior?: OrderDetailHeaderBehavior | null;
  contextRouteGroupId?: number | null;
};

/**
 * Phone header for the order detail page: back chevron, id and plan meta,
 * an icon-only edit, then one action row with the state button filling
 * the width and a compact Cases button. No drag handle: there is nothing
 * to drop the order onto from a phone.
 */
export const OrderDetailHeaderMobile = ({
  openOrderForm,
  openOrderCases,
  onAdvanceOrderState,
  onClose,
  order,
  headerBehavior = null,
  contextRouteGroupId = null,
}: OrderDetailHeaderMobileProps) => {
  const registry = useOrderStateRegistry();
  const nextState = registry.getNextStateName(order?.order_state_id);
  const currentStateName =
    order?.order_state_id != null
      ? (registry.getById(order.order_state_id)?.name ?? "Unknown state")
      : "Unknown state";
  const openCaseCount = order?.open_order_cases ?? 0;

  return (
    <div className="px-3 pt-3">
      <div className="admin-glass-panel-strong relative isolate overflow-hidden rounded-3xl shadow-md!">
        <div
          aria-hidden="true"
          className="admin-context-header-texture admin-context-header-texture--order"
        />
        <div className="admin-header-wash pointer-events-none absolute inset-x-0 top-0 h-44" />

        <div className="relative z-10 flex items-center gap-2 py-2.5 pl-3 pr-2">
          <PageBackButton onClick={onClose} ariaLabel="Close order detail" />
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] shadow-[var(--shadow-button-accent-subtle)]">
            <DocumentIcon className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <div className="min-w-0 flex-1">
            <OrderDetailHeaderTitle
              order={order}
              headerBehavior={headerBehavior}
              contextRouteGroupId={contextRouteGroupId}
            />
          </div>
          <button
            type="button"
            onClick={() =>
              order && openOrderForm({ mode: "edit", clientId: order.client_id })
            }
            disabled={!order}
            aria-label="Edit order"
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-raised text-[var(--color-text)] shadow-[var(--shadow-button-compact)] transition-colors active:bg-surface-hover disabled:opacity-50"
          >
            <EditIcon className="h-4.5 w-4.5 stroke-[var(--color-text)]" />
          </button>
        </div>

        <div className="admin-glass-divider relative z-10 flex items-center gap-2 border-t px-3 py-3">
          <div className="min-w-0 flex-1">
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

          <button
            type="button"
            onClick={() =>
              order?.id &&
              openOrderCases({
                orderId: order.id,
                orderReference: order.reference_number ?? "",
              })
            }
            disabled={!order?.id}
            aria-label={
              openCaseCount > 0
                ? `Open order cases (${openCaseCount} open)`
                : "Open order cases"
            }
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface-raised px-3 text-sm font-medium text-[var(--color-text)] shadow-[var(--shadow-button-compact)] transition-colors active:bg-surface-hover disabled:opacity-50"
          >
            <ArchiveIcon className="h-4 w-4 stroke-[var(--color-text)]" />
            <span>Cases</span>
            {openCaseCount > 0 ? (
              <CounterBadge
                text={String(openCaseCount)}
                bgColor="rgba(var(--warning-vivid-r),0.16)"
                textColor="rgb(var(--warning-marker-r))"
              />
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
};
