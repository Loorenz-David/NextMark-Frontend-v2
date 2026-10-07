import type { OrderOperationTypes } from "@/features/order/types/order";

export const ORDER_FORM_OPERATION_OPTIONS = [
  { label: "Pickup", value: "pickup" },
  { label: "Dropoff", value: "dropoff" },
] as const;

export const operationTypeToSelectedValues = (
  operationType: OrderOperationTypes,
): string[] => {
  if (operationType === "pickup_dropoff") return ["pickup", "dropoff"];
  if (operationType === "pickup") return ["pickup"];
  return ["dropoff"];
};

export const selectedValuesToOperationType = (
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
