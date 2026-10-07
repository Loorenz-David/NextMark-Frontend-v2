import { SingleOrderIcon } from "@/assets/icons";
import { PageBackButton } from "@/shared/buttons/PageBackButton";
import { InfoHover } from "@/shared/layout/InfoHover";
import type { OrderOperationTypes } from "@/features/order/types/order";

import { OrderFormOperationTypeSegment } from "../../components/OrderFormOperationTypeSegment";
import { resolveOrderFormIdentity } from "../../domain/orderFormIdentity";
import { ORDER_FORM_HEADER_INFO } from "../../info/orderFormHeader.info";

type OrderFormHeaderMobileProps = {
  label: string;
  operationType: OrderOperationTypes;
  orderScalarId?: number | null;
  referenceNumber?: string | null;
  externalSource?: string | null;
  onSelectOperationType: (value: string | number) => void;
  onClose: () => void;
};

/**
 * Phone header: back chevron, title and id on one row, then the
 * Pickup/Dropoff control stretched across the width.
 */
export const OrderFormHeaderMobile = ({
  label,
  operationType,
  orderScalarId,
  referenceNumber,
  externalSource,
  onSelectOperationType,
  onClose,
}: OrderFormHeaderMobileProps) => {
  const orderIdentity = resolveOrderFormIdentity({
    orderScalarId,
    referenceNumber,
    externalSource,
  });

  return (
    <header className="shrink-0 border-b border-[var(--color-border)] bg-[var(--surface-popup-chrome)] px-3 pb-3">
      <div className="flex items-center gap-2 py-2">
        <PageBackButton onClick={onClose} ariaLabel="Close order form" />
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-muted)]/12">
          <SingleOrderIcon className="h-5 w-5 text-[var(--color-muted)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-semibold text-[var(--color-text)]">
              {label}
            </h2>
            <InfoHover content={ORDER_FORM_HEADER_INFO} />
          </div>
          {orderIdentity ? (
            <p className="text-xs text-[var(--color-muted)]">{orderIdentity}</p>
          ) : null}
        </div>
      </div>
      <OrderFormOperationTypeSegment
        operationType={operationType}
        onSelectOperationType={onSelectOperationType}
        size="touch"
      />
    </header>
  );
};
