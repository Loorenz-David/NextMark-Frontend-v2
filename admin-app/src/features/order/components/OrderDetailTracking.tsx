import { useState, type ReactNode } from "react";
import { ExclamationIcon } from "@/assets/icons";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

import type { Order } from "../types/order";
import { ClientFormLinkButton } from "./clientFormLink/ClientFormLinkButton";
import { ClientFormLinkStatus } from "./clientFormLink/ClientFormLinkStatus";

type OrderDetailTrackingProps = {
  order: Order | null;
  missingRequiredFields?: string[];
};

type TrackingRowProps = {
  label: string;
  value: ReactNode;
  actions?: ReactNode;
};

type InlineActionButtonProps = {
  children: ReactNode;
  onClick: () => void;
};

const asText = (value?: string | null) => value || "—";

const copyToClipboard = (value: string) => {
  void navigator.clipboard.writeText(value);
};

export const OrderDetailTracking = ({
  order,
  missingRequiredFields = [],
}: OrderDetailTrackingProps) => {
  const hasMissingRequiredInfo = missingRequiredFields.length > 0;
  const [isMissingInfoPopoverOpen, setIsMissingInfoPopoverOpen] = useState(false);

  return (
    <div
      className="admin-glass-panel flex h-[420px] flex-col overflow-hidden rounded-[26px] border-white/10"
      style={{ boxShadow: "none" }}
    >
      <div className="admin-glass-divider border-b px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
            Tracking And Client Form
          </p>
          {hasMissingRequiredInfo ? (
            <FloatingPopover
              open={isMissingInfoPopoverOpen}
              onOpenChange={setIsMissingInfoPopoverOpen}
              offSetNum={8}
              renderInPortal={true}
              classes="relative"
              floatingClassName="z-[140]"
              reference={
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/45 bg-amber-300/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-100"
                  onMouseEnter={() => setIsMissingInfoPopoverOpen(true)}
                  onMouseLeave={() => setIsMissingInfoPopoverOpen(false)}
                  aria-label="Show missing required fields"
                >
                  <ExclamationIcon className="h-3 w-3 text-amber-200" />
                  Missing order info
                </button>
              }
            >
              <div
                className="w-[260px] rounded-[18px] border border-amber-300/25 bg-[linear-gradient(135deg,rgba(255,201,71,0.18),rgba(255,201,71,0.06))] p-3 text-xs text-amber-50 shadow-[0_18px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl"
                onMouseEnter={() => setIsMissingInfoPopoverOpen(true)}
                onMouseLeave={() => setIsMissingInfoPopoverOpen(false)}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Missing required fields
                </p>
                <ul className="list-disc pl-4 text-xs text-[var(--color-text)]">
                  {missingRequiredFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
            </FloatingPopover>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4.5 scroll-thin">
        <TrackingRow
          label="Tracking number"
          value={
            <span className="font-mono text-[0.95rem] text-[var(--color-text)]">
              {asText(order?.tracking_number)}
            </span>
          }
          actions={
            order?.tracking_number ? (
              <InlineActionButton
                onClick={() => copyToClipboard(order.tracking_number!)}
              >
                Copy
              </InlineActionButton>
            ) : null
          }
        />

        {order?.tracking_link ? (
          <TrackingRow
            label="Tracking link"
            value={
              <a
                href={order.tracking_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-sm text-[var(--color-primary)] transition-colors hover:text-white"
              >
                {order.tracking_link}
              </a>
            }
            actions={
              <div className="flex items-center gap-2">
                <InlineActionButton
                  onClick={() => copyToClipboard(order.tracking_link!)}
                >
                  Copy
                </InlineActionButton>
                <a
                  href={order.tracking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-white/[0.08] hover:text-[var(--color-text)]"
                >
                  Open
                </a>
              </div>
            }
          />
        ) : null}

        {typeof order?.id === "number" ? (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.035] px-4 py-4">
            <div className="flex min-w-0 flex-col gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Client Form
                </p>
                <ClientFormLinkStatus
                  clientFormSubmittedAt={order.client_form_submitted_at}
                  tokenHash={order.client_form_token_hash}
                />
                {!order.client_form_submitted_at &&
                !order.client_form_token_hash ? (
                  <p className="text-[0.88rem] text-[var(--color-muted)]">
                    No client form link has been generated yet.
                  </p>
                ) : null}
              </div>
              <div className="w-full min-w-0">
                <ClientFormLinkButton
                  orderId={order.id}
                  clientId={order.client_id}
                  hasGeneratedLink={Boolean(order.client_form_token_hash)}
                  initialEmail={order.client_email ?? null}
                  initialPhone={order.client_primary_phone ?? null}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const TrackingRow = ({ label, value, actions }: TrackingRowProps) => {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[18px] border border-white/8 bg-white/[0.035] px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {label}
        </p>
        <div className="mt-2 min-w-0">{value}</div>
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
};

const InlineActionButton = ({ children, onClick }: InlineActionButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-white/[0.08] hover:text-[var(--color-text)]"
    >
      {children}
    </button>
  );
};
