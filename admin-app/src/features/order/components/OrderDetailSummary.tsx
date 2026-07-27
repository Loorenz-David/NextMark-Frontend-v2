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

type DetailCardProps = {
  label: string;
  value: ReactNode;
  className?: string;
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
    <div className="admin-glass-panel flex h-[420px] flex-col overflow-hidden rounded-3xl border-border shadow-md!">
      <div className="admin-glass-divider flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
              Customer Details
            </p>
            {order?.help_to_carry ? (
              <HelpToCarryIcon
                className="h-5 w-5 text-[var(--color-muted)]"
                aria-label="Help to carry required"
              />
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {hasMissingRequiredInfo && onMissingOrderInfoClick ? (
            <button
              type="button"
              onClick={onMissingOrderInfoClick}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-warning-border bg-warning-bg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-warning transition-colors hover:bg-warning/25"
              aria-label="Open client form for missing order information"
            >
              <ExclamationIcon className="h-3 w-3 text-warning" />
              Missing order info
            </button>
          ) : null}

          {stateName ? (
            <span
              className="inline-flex items-center rounded-full border px-2.5 py-1 text-[0.64rem] font-medium uppercase tracking-[0.16em]"
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

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4.5 scroll-thin">
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailCard label="Customer" value={fullName} />
          <DetailCard
            label="Email"
            value={
              order?.client_email ? (
                <a
                  href={`mailto:${order.client_email}`}
                  className={detailLinkClassName}
                >
                  {order.client_email}
                </a>
              ) : (
                "—"
              )
            }
          />
          <DetailCard
            label="Phone"
            value={
              order?.client_primary_phone ? (
                <a
                  href={`tel:${order.client_primary_phone}`}
                  className={detailLinkClassName}
                >
                  {formatPhone(order.client_primary_phone)}
                </a>
              ) : (
                "—"
              )
            }
          />
          <DetailCard
            label="Second phone"
            value={
              order?.client_secondary_phone ? (
                <a
                  href={`tel:${order.client_secondary_phone}`}
                  className={detailLinkClassName}
                >
                  {formatPhone(order.client_secondary_phone)}
                </a>
              ) : (
                "—"
              )
            }
          />
          <DetailCard
            className="sm:col-span-2"
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
            <DetailCard
              className="sm:col-span-2"
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
        </div>
      </div>

      <div className="admin-glass-divider border-t px-5 py-3">
        <p className="text-[0.72rem] text-[var(--color-muted)]">
          Created at:{" "}
          {toDateOnly(order?.creation_date ?? null) || "missing creation date"}
        </p>
      </div>
    </div>
  );
};

const DetailCard = ({ label, value, className }: DetailCardProps) => {
  return (
    <div
      className={`rounded-3xl border border-border bg-surface-subtle px-4 py-3 ${className ?? ""}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
        {label}
      </p>
      <div className="mt-1 break-words text-[0.98rem] leading-7 text-[var(--color-text)]">
        {value}
      </div>
    </div>
  );
};
