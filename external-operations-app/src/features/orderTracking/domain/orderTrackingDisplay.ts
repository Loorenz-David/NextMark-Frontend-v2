import type { OrderTrackingData } from "../../../api/orderTracking.api";

const hasValue = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const getTrackingOrderIdDisplay = (
  data: Pick<
    OrderTrackingData,
    "external_source" | "reference_number" | "order_scalar_id"
  >,
): string => {
  if (hasValue(data.external_source) && hasValue(data.reference_number)) {
    return data.reference_number;
  }

  return data.order_scalar_id ? `# ${data.order_scalar_id}` : "—";
};
