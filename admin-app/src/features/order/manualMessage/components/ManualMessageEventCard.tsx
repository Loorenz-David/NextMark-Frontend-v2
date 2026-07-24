import { CircularSpinner } from "@/shared/spiners/circular-spinner/CircularSpinner";

import type { ManualMessageRow } from "../controllers/manualMessage.controller";
import type { ManualMessageCardStatus } from "../types/manualMessage";

type ManualMessageEventCardProps = {
  row: ManualMessageRow;
  onSelect: (event: string) => void;
};

const STATUS_LABEL: Record<ManualMessageCardStatus, string | null> = {
  idle: null,
  sending: "Sending",
  sent: "Sent",
  partial: "Partial",
  failed: "Failed",
  skipped: "Not sent",
  not_found: "Not found",
};

const STATUS_TONE_CLASS: Record<ManualMessageCardStatus, string> = {
  idle: "",
  sending: "border-sky-300/30 bg-sky-300/[0.12] text-sky-700",
  sent: "border-emerald-300/35 bg-emerald-300/[0.14] text-emerald-700",
  partial: "border-amber-300/35 bg-amber-300/[0.14] text-amber-700",
  failed: "border-rose-300/35 bg-rose-300/[0.14] text-rose-700",
  skipped: "border-[var(--color-border-accent)] bg-black/[0.04] text-[var(--color-muted)]",
  not_found: "border-rose-300/35 bg-rose-300/[0.14] text-rose-700",
};

export const ManualMessageEventCard = ({
  row,
  onSelect,
}: ManualMessageEventCardProps) => {
  const statusLabel = STATUS_LABEL[row.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(row.event)}
      aria-pressed={row.isSelected}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
        row.isSelected
          ? "border-[var(--color-dark-blue)] bg-[var(--color-dark-blue)]/[0.06]"
          : "border-[var(--color-border-accent)] hover:bg-black/[0.03]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-3.5 w-3.5 shrink-0 rounded-full border ${
          row.isSelected
            ? "border-[var(--color-dark-blue)] border-[4px]"
            : "border-[var(--color-border-accent)]"
        }`}
      />

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm text-[var(--color-text)]">
            {row.label}
          </span>
          <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            {row.channels.join(" · ")}
          </span>
        </span>
        {row.detail ? (
          <span className="mt-0.5 block truncate text-[11px] text-[var(--color-muted)]">
            {row.detail}
          </span>
        ) : null}
      </span>

      {row.status === "sending" ? (
        <CircularSpinner width={14} height={14} className="shrink-0" />
      ) : statusLabel ? (
        <span
          // last_error is raw backend text — kept to a tooltip, never primary copy.
          title={row.error ?? undefined}
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ${STATUS_TONE_CLASS[row.status]}`}
        >
          {statusLabel}
        </span>
      ) : null}
    </button>
  );
};
