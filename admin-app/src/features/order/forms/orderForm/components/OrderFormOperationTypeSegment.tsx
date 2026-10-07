import type { OrderOperationTypes } from "@/features/order/types/order";

import {
  ORDER_FORM_OPERATION_OPTIONS,
  operationTypeToSelectedValues,
  selectedValuesToOperationType,
} from "../domain/orderFormOperationType";
import { MultiSegmentedCheckboxList } from "./MultiSegmentedCheckboxList";

type OrderFormOperationTypeSegmentProps = {
  operationType: OrderOperationTypes;
  onSelectOperationType: (value: string | number) => void;
  /** Phone headers stretch the control and give it a finger-sized hit area. */
  size?: "compact" | "touch";
};

/** Pickup / Dropoff multi-select shared by the desktop and phone headers. */
export const OrderFormOperationTypeSegment = ({
  operationType,
  onSelectOperationType,
  size = "compact",
}: OrderFormOperationTypeSegmentProps) => (
  <MultiSegmentedCheckboxList
    options={ORDER_FORM_OPERATION_OPTIONS.map((option) => ({ ...option }))}
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
      textSize: size === "touch" ? "14px" : "12px",
      buttonPadding: size === "touch" ? "10px 14px" : "8px 14px",
      containerBg:
        "color-mix(in srgb, var(--foreground-mark) 4.5%, transparent)",
      containerBorder:
        "color-mix(in srgb, var(--foreground-mark) 14%, transparent)",
      containerShadow: "inset 0 1px 0 var(--paper-raised)",
      selectedBg:
        "linear-gradient(180deg, rgba(var(--info-r),0.22), rgba(var(--info-r),0.16))",
      selectedBorder: "rgba(var(--info-r),0.42)",
      selectedShadow:
        "inset 0 1px 0 color-mix(in srgb, var(--foreground-mark) 14%, transparent)",
      textColor: "color-mix(in srgb, var(--foreground-mark) 68%, transparent)",
      selectedTextColor: "var(--info-ink)",
      gap: "4px",
      containerPadding: size === "touch" ? "4px" : "6px",
    }}
  />
);
