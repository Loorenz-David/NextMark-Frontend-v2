import { Children, useMemo, useState, type ReactNode } from "react";

import { ORDER_DETAIL_SECTIONS } from "../domain/orderDetailSections.domain";

type OrderDetailSectionsProps = {
  /** Index into `ORDER_DETAIL_SECTIONS`. */
  initialIndex?: number;
  children: ReactNode;
};

/**
 * Segmented switcher above one order detail section at a time (phone,
 * iPad and desktop). Sections grow to their content so the page is the
 * only thing that scrolls; a card with its own scroll inside the page
 * trapped swipes on the way down.
 */
export const OrderDetailSections = ({
  initialIndex = 0,
  children,
}: OrderDetailSectionsProps) => {
  const sections = useMemo(() => Children.toArray(children), [children]);
  const total = Math.min(sections.length, ORDER_DETAIL_SECTIONS.length);
  const safeInitialIndex =
    total > 0 ? Math.max(0, Math.min(initialIndex, total - 1)) : 0;
  const [index, setIndex] = useState(safeInitialIndex);

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        role="tablist"
        aria-label="Order detail sections"
        className="flex w-full items-stretch rounded-2xl border border-border bg-surface-subtle p-1"
      >
        {ORDER_DETAIL_SECTIONS.slice(0, total).map(
          (section, sectionIndex) => {
            const isActive = sectionIndex === index;
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setIndex(sectionIndex)}
                className={`min-h-10 flex-1 cursor-pointer rounded-xl px-2 text-rem-0_82 font-medium transition-colors ${
                  isActive
                    ? "bg-surface-raised text-[var(--color-text)] shadow-[var(--shadow-button-compact)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)] active:bg-surface-hover"
                }`}
              >
                {section.label}
              </button>
            );
          },
        )}
      </div>

      <div role="tabpanel" className="w-full">
        {sections[index] ?? null}
      </div>
    </div>
  );
};
