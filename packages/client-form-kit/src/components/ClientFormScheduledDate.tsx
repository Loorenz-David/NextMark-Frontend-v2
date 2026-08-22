import type { ClientFormMeta } from "../domain/clientForm.types";
import { getClientFormScheduledDelivery } from "../domain/clientFormOrderDisplay";

type Props = {
  meta: ClientFormMeta;
};

/**
 * The order's route-plan schedule date, shown as a masthead line under the form
 * title. Renders nothing when the order has no plan or no scheduled date, so a
 * form opened before an order is scheduled simply omits it.
 */
export const ClientFormScheduledDate = ({ meta }: Props) => {
  const label = getClientFormScheduledDelivery(meta);
  if (!label) {
    return null;
  }

  return (
    <p className="text-[length:var(--cf-eyebrow)] font-semibold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
      Scheduled delivery
      <span className="mt-1 block text-[length:var(--cf-input)] font-normal normal-case tracking-normal text-[var(--ink)]">
        {label}
      </span>
    </p>
  );
};
