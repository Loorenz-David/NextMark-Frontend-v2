import type { ReactNode } from "react";

import { formatPhone } from "@/shared/data-validation/phoneValidation";
import { toDateOnly } from "@/shared/data-validation/timeValidation";

import type { Order } from "../types/order";
import type { OrderState } from "../types/orderState";

type OrderDetailSummaryProps = {
  order: Order | null;
  orderState: OrderState | null;
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
}: OrderDetailSummaryProps) => {
  const fullName =
    `${asText(order?.client_first_name)} ${asText(order?.client_last_name)}`.trim();
  const stateColor = orderState?.color ?? "var(--color-primary)";
  const stateName = orderState?.name ?? null;

  return (
    <div
      className="admin-glass-panel flex h-[420px] flex-col overflow-hidden rounded-[26px] border-white/10"
      style={{ boxShadow: "none" }}
    >
      <div className="admin-glass-divider flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
            Customer Details
          </p>
        </div>
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
        </div>
      </div>

      <div className="admin-glass-divider border-t px-5 py-3">
        <p className="text-[0.72rem] text-[var(--color-muted)]">
          Created at: {toDateOnly(order?.creation_date ?? null) || "missing creation date"}
        </p>
      </div>
    </div>
  );
};

const DetailCard = ({ label, value, className }: DetailCardProps) => {
  return (
    <div
      className={`rounded-[20px] border border-white/10 bg-white/[0.035] px-4 py-3 ${className ?? ""}`}
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
