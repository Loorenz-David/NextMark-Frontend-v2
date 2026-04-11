import { useMemo, useState } from "react";

import { ExclamationIcon } from "@/assets/icons";
import { getOrderMissingRequiredFieldLabels } from "@/features/order/domain/orderMissingRequiredInfo.domain";
import { useOrderValidation } from "@/features/order/domain/useOrderValidation";
import { useOrderActions } from "@/features/order";
import type { Order } from "@/features/order/types/order";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

type OrderMissingInfoNotifierProps = {
  order: Order;
};

export const OrderMissingInfoNotifier = ({
  order,
}: OrderMissingInfoNotifierProps) => {
  const validators = useOrderValidation();
  const { openOrderForm } = useOrderActions();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const missingFields = useMemo(
    () => getOrderMissingRequiredFieldLabels(order, validators),
    [order, validators],
  );

  if (!missingFields.length || order.archive_at) {
    return null;
  }

  return (
    <FloatingPopover
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
      offSetNum={8}
      crossOffSetNum={-4}
      renderInPortal={true}
      classes={`absolute -left-2 -top-3 ${isPopoverOpen ? "z-2" : "z-1"}`}
      reference={
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-yellow-500/60 bg-yellow-300 shadow-sm"
          aria-label="Order has missing information"
          onMouseEnter={() => setIsPopoverOpen(true)}
          onMouseLeave={() => setIsPopoverOpen(false)}
          onClick={(event) => {
            event.stopPropagation();
            setIsPopoverOpen(false);
            openOrderForm({ clientId: order.client_id, mode: "edit" });
          }}
        >
          <ExclamationIcon className="h-4 w-4 text-yellow-900" />
        </button>
      }
    >
      <div
        className="w-[240px] rounded-[20px] border border-amber-300/25 bg-[linear-gradient(135deg,rgba(255,201,71,0.18),rgba(255,201,71,0.06))] p-3 text-xs text-amber-50 shadow-[0_18px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl"
        onMouseEnter={() => setIsPopoverOpen(true)}
        onMouseLeave={() => setIsPopoverOpen(false)}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Missing information
        </p>
        <ul className="list-disc pl-4 text-xs text-[var(--color-text)]">
          {missingFields.map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-[var(--color-muted)]">
          Click the warning icon to complete this order.
        </p>
      </div>
    </FloatingPopover>
  );
};
