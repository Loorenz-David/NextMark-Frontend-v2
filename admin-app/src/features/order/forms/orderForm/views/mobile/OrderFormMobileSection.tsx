import type { ReactNode } from "react";

type OrderFormMobileSectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

/** Titled card; rows inside are separated by hairlines. */
export const OrderFormMobileSection = ({
  title,
  action,
  children,
}: OrderFormMobileSectionProps) => (
  <section className="flex flex-col gap-2">
    <div className="flex min-h-6 items-center justify-between gap-3 px-1">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
        {title}
      </h3>
      {action ?? null}
    </div>
    <div className="divide-y divide-[var(--color-border-accent)] overflow-hidden rounded-2xl border border-[var(--color-border-accent)] bg-[var(--surface-popup-chrome)] shadow-sm">
      {children}
    </div>
  </section>
);

export const OrderFormMobileRow = ({ children }: { children: ReactNode }) => (
  <div className="px-4 py-2">{children}</div>
);
