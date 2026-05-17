import type { ClientFormMeta } from "./clientForm.types";

const hasValue = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const getClientFormOrderTitle = (meta: ClientFormMeta): string => {
  if (hasValue(meta.external_source) && hasValue(meta.reference_number)) {
    return `Order ${meta.reference_number}`;
  }

  return `Order # ${meta.order_scalar_id || "—"}`;
};
