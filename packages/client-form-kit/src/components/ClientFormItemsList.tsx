import type { ClientFormItem } from "../domain/clientForm.types";

type ClientFormItemsListProps = {
  items: ClientFormItem[];
};

/** A ledger block: ruled rows, a quantity column, no fills. */
export const ClientFormItemsList = ({ items }: ClientFormItemsListProps) => {
  if (!items.length) return null;

  return (
    <section className="rounded-[var(--radius)] border border-[var(--rule-strong)] bg-[var(--paper-raised)] px-5 py-4">
      <div className="flex items-baseline justify-between gap-3 border-b border-[var(--rule-strong)] pb-3">
        <h2 className="text-[length:var(--cf-label)] font-semibold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
          Items
        </h2>
        <span className="text-[length:var(--cf-label)] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
          {items.length} {items.length === 1 ? "line" : "lines"}
        </span>
      </div>

      <div className="flex flex-col divide-y divide-[var(--rule)]">
        {items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex items-baseline justify-between gap-4 py-3"
          >
            <p className="min-w-0 flex-1 truncate text-[length:var(--cf-input)] text-[var(--ink)]">
              {item.name || "Unnamed item"}
            </p>
            {/* Tabular figures keep the quantity column aligned down the page. */}
            <p className="shrink-0 text-[length:var(--cf-input)] tabular-nums text-[var(--ink)]">
              &times;&nbsp;{item.quantity}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
