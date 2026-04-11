import { CloseIcon, SingleOrderIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { InfoHover } from "@/shared/layout/InfoHover";
import type { OrderOperationTypes } from "@/features/order/types/order";
import { MultiSegmentedCheckboxList } from "./MultiSegmentedCheckboxList";
import { ORDER_FORM_HEADER_INFO } from "../info/orderFormHeader.info";

type OrderFormHeaderProps = {
  label: string;
  operationType: OrderOperationTypes;
  isMobile: boolean;
  orderScalarId?: number | null;
  onSelectOperationType: (value: string | number) => void;
  onClose?: () => void;
};

const OPERATION_OPTIONS = [
  { label: "Pickup", value: "pickup" },
  { label: "Dropoff", value: "dropoff" },
] as const;

const operationTypeToSelectedValues = (
  operationType: OrderOperationTypes,
): string[] => {
  if (operationType === "pickup_dropoff") return ["pickup", "dropoff"];
  if (operationType === "pickup") return ["pickup"];
  return ["dropoff"];
};

const selectedValuesToOperationType = (
  values: Array<string | number>,
): OrderOperationTypes => {
  const normalized = values.map(String);
  const hasPickup = normalized.includes("pickup");
  const hasDropoff = normalized.includes("dropoff");

  if (hasPickup && hasDropoff) return "pickup_dropoff";
  if (hasPickup) return "pickup";
  if (hasDropoff) return "dropoff";
  return "dropoff";
};

export const OrderFormHeader = ({
  label,
  operationType,
  orderScalarId,
  isMobile,
  onSelectOperationType,
  onClose,
}: OrderFormHeaderProps) => (
  <header
    className={`flex items-center justify-between gap-4 border-b border-[var(--color-border)] ${
      isMobile ? "px-3 pb-4 pt-4" : "px-6 py-3"
    }`}
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
        {typeof orderScalarId === "number" && (
          <span className="text-[10px]">#{orderScalarId}</span>
        )}
      </div>
      <div>
        <MultiSegmentedCheckboxList
          options={OPERATION_OPTIONS.map((option) => ({ ...option }))}
          selectedValues={operationTypeToSelectedValues(operationType)}
          onChange={(values) =>
            onSelectOperationType(selectedValuesToOperationType(values))
          }
          rules={{
            atLeastOneSelected: true,
            fallbackMode: "switch_to_adjacent",
          }}
          defaultValue="dropoff"
          styleConfig={{
            textSize: "12px",
            buttonPadding: "8px 14px",
            containerBg: "rgba(255,255,255,0.045)",
            containerBorder: "rgba(255,255,255,0.14)",
            containerShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            selectedBg:
              "linear-gradient(180deg, rgba(113, 205, 233, 0.22), rgba(84, 146, 209, 0.16))",
            selectedBorder: "rgba(113, 205, 233, 0.42)",
            selectedShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
            textColor: "rgba(255,255,255,0.68)",
            selectedTextColor: "rgb(213, 247, 255)",
            gap: "4px",
            containerPadding: "6px",
          }}
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
