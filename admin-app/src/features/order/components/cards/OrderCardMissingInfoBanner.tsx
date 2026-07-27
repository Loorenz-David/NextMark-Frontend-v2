import { useMemo } from "react";

import { ExclamationIcon } from "@/assets/icons";
import { cn } from "@/lib/utils/cn";
import { getOrderMissingRequiredFieldLabels } from "@/features/order/domain/orderMissingRequiredInfo.domain";
import { useOrderValidation } from "@/features/order/domain/useOrderValidation";
import { useOrderActions } from "@/features/order";
import type { Order } from "@/features/order/types/order";

type OrderCardMissingInfoBannerProps = {
  order: Order;
  /** Positional margins bleeding the banner to the host card's edges. */
  className?: string;
};

export const OrderCardMissingInfoBanner = ({
  order,
  className,
}: OrderCardMissingInfoBannerProps) => {
  const validators = useOrderValidation();
  const { openOrderForm } = useOrderActions();

  const missingFields = useMemo(
    () => getOrderMissingRequiredFieldLabels(order, validators),
    [order, validators],
  );

  if (!missingFields.length || order.archive_at) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative z-10 flex items-center justify-between gap-3 rounded-b-lg border-t border-warning-border bg-warning-bg px-4 py-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-300">
          <ExclamationIcon className="h-3 w-3 text-yellow-900" />
        </span>
        <span
          className="truncate text-xs font-medium text-warning"
          title={missingFields.join(", ")}
        >
          Customer info missing
        </span>
      </div>
      <button
        type="button"
        className="-my-2 -mr-2 shrink-0 px-3 py-2.5 text-xs font-semibold text-warning underline underline-offset-2 transition hover:opacity-80"
        aria-label="Add missing customer information"
        onClick={(event) => {
          event.stopPropagation();
          openOrderForm({ clientId: order.client_id, mode: "edit" });
        }}
      >
        Add
      </button>
    </div>
  );
};
