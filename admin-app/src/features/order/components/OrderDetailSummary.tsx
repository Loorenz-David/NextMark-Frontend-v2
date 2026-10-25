import type { ReactNode } from "react";

import { ExclamationIcon, HelpToCarryIcon } from "@/assets/icons";
import { formatPhone } from "@/shared/data-validation/phoneValidation";
import { toDateOnly } from "@/shared/data-validation/timeValidation";

import type { Order } from "../types/order";
import type { OrderState } from "../types/orderState";

type OrderDetailSummaryProps = {
  order: Order | null;
  orderState: OrderState | null;
  missingRequiredFields?: string[];
  onMissingOrderInfoClick?: () => void;
  onTrackingLinkCopy?: () => void;
};

type DetailRowProps = {
  label: string;
  value: ReactNode;
};

const asText = (value?: string | null) => value || "—";

const detailLinkClassName =
  "text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]";

export const OrderDetailSummary = ({
  order,
  orderState,
  missingRequiredFields = [],
  onMissingOrderInfoClick,
  onTrackingLinkCopy,
}: OrderDetailSummaryProps) => {
  const fullName =
    `${asText(order?.client_first_name)} ${asText(order?.client_last_name)}`.trim();
  const stateColor = orderState?.color ?? "var(--color-primary)";
  const stateName = orderState?.name ?? null;
  const hasMissingRequiredInfo =
    missingRequiredFields.length > 0 && typeof order?.id === "number";
  const hasTrackingInfo = Boolean(
    order?.tracking_number || order?.tracking_link,
  );

  return (
    <div className="admin-glass-panel flex flex-col overflow-hidden rounded-3xl border-border shadow-md!">
      <div className="admin-glass-divider flex flex-wrap items-center justify-between gap-2 border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
            Customer
          </p>
          {order?.help_to_carry ? (
            <HelpToCarryIcon
              className="h-5 w-5 text-[var(--color-muted)]"
              aria-label="Help to carry required"
            />
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {hasMissingRequiredInfo && onMissingOrderInfoClick ? (
            <button
              type="button"
              onClick={onMissingOrderInfoClick}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-warning-border bg-warning-bg px-2.5 py-1 text-micro font-semibold uppercase tracking-[0.1em] text-warning transition-colors hover:bg-warning/25"
              aria-label="Open client form for missing order information"
            >
              <ExclamationIcon className="h-3 w-3 text-warning" />
              Missing order info
            </button>
          ) : null}

          {stateName ? (
            <span
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-rem-0_64 font-medium uppercase tracking-[0.16em]"
              style={{
                color: stateColor,
                borderColor: `${stateColor}55`,
                backgroundColor: `${stateColor}18`,
              }}
            >
              {stateName}
            </span>
          ) : null}
        </div>
      </div>

      <dl className="flex flex-col divide-y divide-[var(--color-border)] px-4">
        <DetailRow label="Name" value={fullName} />
        <DetailRow
          label="Email"
          value={
            order?.client_email ? (
              <a href={`mailto:${order.client_email}`} className={detailLinkClassName}>
                {order.client_email}
              </a>
            ) : (
              "—"
            )
          }
        />
        <DetailRow
          label="Phone"
          value={
            order?.client_primary_phone ? (
              <a href={`tel:${order.client_primary_phone}`} className={detailLinkClassName}>
                {formatPhone(order.client_primary_phone)}
              </a>
            ) : (
              "—"
            )
          }
        />
        {order?.client_secondary_phone ? (
          <DetailRow
            label="Second phone"
            value={
              <a href={`tel:${order.client_secondary_phone}`} className={detailLinkClassName}>
                {formatPhone(order.client_secondary_phone)}
              </a>
            }
          />
        ) : null}
        <DetailRow
          label="Address"
          value={
            order?.client_address?.street_address ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  order.client_address.street_address,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={detailLinkClassName}
              >
                {order.client_address.street_address}
              </a>
            ) : (
              "—"
            )
          }
        />

        {hasTrackingInfo ? (
          <DetailRow
            label="Tracking number"
            value={
              <div className="flex min-w-0 items-center justify-between gap-3">
                <span className="min-w-0 break-all font-mono">
                  {asText(order?.tracking_number)}
                </span>
                {order?.tracking_link && onTrackingLinkCopy ? (
                  <button
                    type="button"
                    onClick={onTrackingLinkCopy}
                    className="inline-flex shrink-0 items-center rounded-xl border border-border bg-surface-raised px-2.5 py-1 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-surface-hover hover:text-[var(--color-text)]"
                    aria-label="Copy tracking link"
                  >
                    Copy
                  </button>
                ) : null}
              </div>
            }
          />
        ) : null}
      </dl>

      <div className="admin-glass-divider border-t px-4 py-3">
        <p className="text-sm text-[var(--color-muted)]">
          Created{" "}
          {toDateOnly(order?.creation_date ?? null) || "date missing"}
        </p>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }: DetailRowProps) => {
  return (
    <div className="py-3">
      <dt className="text-micro font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]/80">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-base text-[var(--color-text)]">
        {value}
      </dd>
    </div>
  );
};
