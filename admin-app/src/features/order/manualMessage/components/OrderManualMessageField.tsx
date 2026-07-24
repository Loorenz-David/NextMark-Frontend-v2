import { SearchIcon } from "@/assets/icons";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { CircularSpinner } from "@/shared/spiners/circular-spinner/CircularSpinner";

import { useManualMessageController } from "../controllers/manualMessage.controller";
import { ManualMessageEventCard } from "./ManualMessageEventCard";

type OrderManualMessageFieldProps = {
  /** Server id of an existing order. The field is meaningless before the order is created. */
  orderId: number;
  className?: string;
};

/**
 * Lets an operator manually send a configured message to the order's customer.
 *
 * Self-contained: give it an order id and it fetches its own templates, tracks
 * its own delivery status over realtime, and needs no surrounding provider.
 */
export const OrderManualMessageField = ({
  orderId,
  className,
}: OrderManualMessageFieldProps) => {
  const controller = useManualMessageController({ orderId });

  return (
    <div
      className={`rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-sm ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Send message to customer
        </p>
      </div>

      <div className="px-4 pt-2">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border-accent)] px-3 py-1.5">
          <SearchIcon
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-[var(--color-muted)]"
          />
          <input
            type="text"
            value={controller.searchQuery}
            onChange={(event) => controller.setSearchQuery(event.target.value)}
            placeholder="Search messages"
            aria-label="Search messages"
            className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
          />
        </div>
      </div>

      <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto px-4 py-3 scroll-thin">
        {controller.isLoading ? (
          <div className="flex items-center gap-2 px-1 py-2 text-xs text-[var(--color-muted)]">
            <CircularSpinner width={14} height={14} />
            Loading messages...
          </div>
        ) : null}

        {controller.isEmpty ? (
          <p className="px-1 py-2 text-xs text-[var(--color-muted)]">
            No messages are configured yet. Set one up in Messages settings.
          </p>
        ) : null}

        {controller.hasNoSearchResults ? (
          <p className="px-1 py-2 text-xs text-[var(--color-muted)]">
            No messages match this search.
          </p>
        ) : null}

        {controller.rows.map((row) => (
          <ManualMessageEventCard
            key={row.event}
            row={row}
            onSelect={controller.selectEvent}
          />
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border-accent)] px-4 py-2">
        <BasicButton
          params={{
            variant: "primary",
            onClick: () => {
              void controller.send();
            },
            disabled: !controller.canSend,
            ariaLabel: "Send message to customer",
          }}
        >
          {controller.isSending ? "Sending..." : "Send"}
        </BasicButton>
      </div>
    </div>
  );
};
