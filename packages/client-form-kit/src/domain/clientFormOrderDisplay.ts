import type { ClientFormMeta } from "./clientForm.types";

const hasValue = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * `null` when the form is not attached to an order yet — the in-store device
 * opens it before one exists, and the host supplies its own heading then.
 */
export const getClientFormOrderTitle = (meta: ClientFormMeta): string | null => {
  if (hasValue(meta.external_source) && hasValue(meta.reference_number)) {
    return `Order ${meta.reference_number}`;
  }

  return meta.order_scalar_id ? `Order # ${meta.order_scalar_id}` : null;
};
