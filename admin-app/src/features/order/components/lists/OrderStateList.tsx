import { useMemo } from "react";

import { CheckMarkIcon } from "@/assets/icons";
import { usePopupManager } from "@/shared/resource-manager/useResourceManager";

import { useOrderStateController } from "../../controllers/orderState.controller";
import { useOrderStates } from "../../store/orderStateHooks.store";
import type { Order } from "../../types/order";

type OrderStateListProps = {
  order: Order;
};

export const OrderStateList = ({ order }: OrderStateListProps) => {
  const states = useOrderStates();
  const controller = useOrderStateController();
  const popupManager = usePopupManager();

  const orderedStates = useMemo(
    () =>
      [...states].sort((a, b) => {
        const aIndex =
          typeof a.index === "number" ? a.index : Number.MAX_SAFE_INTEGER;
        const bIndex =
          typeof b.index === "number" ? b.index : Number.MAX_SAFE_INTEGER;
        if (aIndex !== bIndex) return aIndex - bIndex;
        return (a.id ?? 0) - (b.id ?? 0);
      }),
    [states],
  );

  const currentStateId =
    typeof order.order_state_id === "number" ? order.order_state_id : null;

  if (!orderedStates.length) {
    return (
      <div className="px-2 py-2 text-sm text-[var(--color-muted)]">
        No order states available.
      </div>
    );
  }

  return (
    <div className="w-full max-h-[280px] overflow-y-auto scroll-thin">
      {orderedStates.map((state) => {
        const isCurrent = state.id === currentStateId;
        const isDisabled = isCurrent;

        return (
          <button
            key={state.client_id}
            type="button"
            disabled={isDisabled}
            data-popover-close={isDisabled ? undefined : "true"}
            onClick={() => {
              if (isDisabled) return;

              const isFailState =
                String(state.name ?? "").toUpperCase() === "FAIL";
              if (isFailState) {
                popupManager.open({
                  key: "order.failure-note.create",
                  payload: {
                    clientId: order.client_id,
                    targetStateId: state.id,
                  },
                });
                return;
              }

              void controller.setOrderState(order.client_id, state.id);
            }}
            className={`w-full flex items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors ${
              isDisabled
                ? "cursor-not-allowed opacity-60"
                : "hover:bg-[var(--color-muted)]/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{state.name}</span>
              {isCurrent ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-muted)]/20 text-[var(--color-muted)]">
                  Current
                </span>
              ) : null}
            </div>

            {isCurrent ? <CheckMarkIcon className="h-4 w-4" /> : null}
          </button>
        );
      })}
    </div>
  );
};
