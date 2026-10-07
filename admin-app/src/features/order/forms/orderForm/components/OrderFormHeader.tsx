import { CloseIcon, SingleOrderIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { InfoHover } from "@/shared/layout/InfoHover";
import type { OrderOperationTypes } from "@/features/order/types/order";
import { OrderFormOperationTypeSegment } from "./OrderFormOperationTypeSegment";
import { ORDER_FORM_HEADER_INFO } from "../info/orderFormHeader.info";
import { resolveOrderFormIdentity } from "../domain/orderFormIdentity";

type OrderFormHeaderProps = {
  label: string;
  operationType: OrderOperationTypes;
  orderScalarId?: number | null;
  referenceNumber?: string | null;
  externalSource?: string | null;
  onSelectOperationType: (value: string | number) => void;
  onClose?: () => void;
};

/** Desktop popup header. The phone layout renders `OrderFormHeaderMobile`. */
export const OrderFormHeader = ({
  label,
  operationType,
  orderScalarId,
  referenceNumber,
  externalSource,
  onSelectOperationType,
  onClose,
}: OrderFormHeaderProps) => {
  const orderIdentity = resolveOrderFormIdentity({
    orderScalarId,
    referenceNumber,
    externalSource,
  });

  return (
  <header
    className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--surface-popup-chrome)] px-6 py-3"
  >
    <div className="flex items-center justify-center rounded-full bg-[var(--color-muted)]/12 p-2">
      <SingleOrderIcon className="h-6 w-6 text-[var(--color-muted)]" />
    </div>

    <div className="flex gap-6 items-center">
      <div className="flex flex-col  items-start justify-start">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            {label}
          </h3>
          <InfoHover content={ORDER_FORM_HEADER_INFO} />
        </div>
        {orderIdentity && (
          <span className="text-[10px]">{orderIdentity}</span>
        )}
      </div>
      <div>
        <OrderFormOperationTypeSegment
          operationType={operationType}
          onSelectOperationType={onSelectOperationType}
        />
      </div>
    </div>

    <div className="flex flex-1 items-center justify-end">
      <BasicButton
        params={{
          variant: "rounded",
          onClick: onClose,
          ariaLabel: "Close order form",
          style: { border: "1px solid rgb(var(--color-muted-r), 0.4)" },
        }}
      >
        <CloseIcon className="app-icon h-4 w-4" />
      </BasicButton>
    </div>
  </header>
  );
};
