import { Children, useMemo, useState, type ReactNode } from "react";

import { ORDER_DETAIL_MOBILE_SECTIONS } from "../domain/orderDetailMobileSections.domain";

type OrderDetailMobileSectionsProps = {
  /** Index into `ORDER_DETAIL_MOBILE_SECTIONS`; same order as the desktop carousel. */
  initialIndex?: number;
  children: ReactNode;
};

/**
 * Phone replacement for the detail carousel: a segmented switcher above
 * one section at a time. Sections grow to their content so the page is
 * the only thing that scrolls, instead of a fixed-height card with its
 * own scrollbar inside the page scroll.
 */
export const OrderDetailMobileSections = ({
  initialIndex = 0,
  children,
}: OrderDetailMobileSectionsProps) => {
  const sections = useMemo(() => Children.toArray(children), [children]);
  const total = Math.min(sections.length, ORDER_DETAIL_MOBILE_SECTIONS.length);
  const safeInitialIndex = total > 0 ? Math.max(0, Math.min(initialIndex, total - 1)) : 0;
  const [index, setIndex] = useState(safeInitialIndex);

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        role="tablist"
        aria-label="Order detail sections"
        className="flex w-full items-stretch rounded-2xl border border-border bg-surface-subtle p-1"
      >
        {ORDER_DETAIL_MOBILE_SECTIONS.slice(0, total).map((section, sectionIndex) => {
          const isActive = sectionIndex === index;
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setIndex(sectionIndex)}
              className={`min-h-10 flex-1 cursor-pointer rounded-xl px-2 text-[0.82rem] font-medium transition-colors ${
                isActive
                  ? "bg-surface-raised text-[var(--color-text)] shadow-[var(--shadow-button-compact)]"
                  : "text-[var(--color-muted)] active:bg-surface-hover"
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      {/* The cards are built for the desktop carousel with a fixed 420px
          height and an inner scroll area; release that here so each one
          takes the height of its content. */}
      <div
        role="tabpanel"
        className="w-full [&>div]:h-auto [&>div]:max-h-none [&>div>div]:overflow-visible"
      >
        {sections[index] ?? null}
      </div>
    </div>
  );
};
