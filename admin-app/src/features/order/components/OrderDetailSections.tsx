import { Children, useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { ChevronDownIcon } from "@/assets/icons";

import {
  nextSectionWindowStart,
  ORDER_DETAIL_SECTIONS,
  ORDER_DETAIL_SECTIONS_VISIBLE,
  resolveSectionWindowStart,
} from "../domain/orderDetailSections.domain";

type OrderDetailSectionsProps = {
  /** Index into `ORDER_DETAIL_SECTIONS`. */
  initialIndex?: number;
  children: ReactNode;
};

const SLIDE_TRANSITION = "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)";
const INDICATOR_TRANSITION = `${SLIDE_TRANSITION}, opacity 200ms ease-out`;

/**
 * Segmented switcher above one order detail section at a time (phone,
 * iPad and desktop). Sections grow to their content so the page is the
 * only thing that scrolls; a card with its own scroll inside the page
 * trapped swipes on the way down.
 *
 * At most `ORDER_DETAIL_SECTIONS_VISIBLE` labels show; with more, a chevron
 * slides the row to the rest and back.
 */
export const OrderDetailSections = ({
  initialIndex = 0,
  children,
}: OrderDetailSectionsProps) => {
  const sections = useMemo(() => Children.toArray(children), [children]);
  const total = Math.min(sections.length, ORDER_DETAIL_SECTIONS.length);
  const visibleCount = Math.min(total, ORDER_DETAIL_SECTIONS_VISIBLE);
  const hasOverflow = total > visibleCount;
  const safeInitialIndex =
    total > 0 ? Math.max(0, Math.min(initialIndex, total - 1)) : 0;

  const [index, setIndex] = useState(safeInitialIndex);
  const [direction, setDirection] = useState(0);
  const [windowStart, setWindowStart] = useState(() =>
    resolveSectionWindowStart(safeInitialIndex, 0, total),
  );
  const prefersReducedMotion = useReducedMotion();

  const isAtLastWindow = windowStart + visibleCount >= total;
  // Off-screen, the active pill's shadow would show at the clipped edge.
  const isActiveInView = index >= windowStart && index < windowStart + visibleCount;
  const tabWidthPercent = visibleCount > 0 ? 100 / visibleCount : 100;

  const selectSection = (nextIndex: number) => {
    if (nextIndex === index) return;
    setDirection(nextIndex > index ? 1 : -1);
    setIndex(nextIndex);
    setWindowStart((current) => resolveSectionWindowStart(nextIndex, current, total));
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full items-center gap-1 rounded-full border border-border bg-surface-subtle p-1">
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-full">
          <div
            role="tablist"
            aria-label="Order detail sections"
            className="relative flex w-full"
            style={{
              transform: `translateX(-${windowStart * tabWidthPercent}%)`,
              transition: prefersReducedMotion ? undefined : SLIDE_TRANSITION,
            }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 rounded-full bg-surface-raised shadow-[var(--shadow-button-compact)]"
              style={{
                width: `${tabWidthPercent}%`,
                transform: `translateX(${index * 100}%)`,
                opacity: isActiveInView ? 1 : 0,
                transition: prefersReducedMotion ? undefined : INDICATOR_TRANSITION,
              }}
            />
            {ORDER_DETAIL_SECTIONS.slice(0, total).map((section, sectionIndex) => {
              const isActive = sectionIndex === index;
              const isInView =
                sectionIndex >= windowStart &&
                sectionIndex < windowStart + visibleCount;
              return (
                <button
                  key={section.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isInView ? 0 : -1}
                  onClick={() => selectSection(sectionIndex)}
                  className={`relative z-10 min-h-10 shrink-0 cursor-pointer truncate rounded-full px-2 text-px-13 font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-[var(--color-text)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                  }`}
                  style={{ flexBasis: `${tabWidthPercent}%` }}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {hasOverflow ? (
          <button
            type="button"
            onClick={() =>
              setWindowStart((current) => nextSectionWindowStart(current, total))
            }
            aria-label={isAtLastWindow ? "Show first sections" : "Show more sections"}
            className="touch-hit-area flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-surface-hover hover:text-[var(--color-text)]"
          >
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform duration-300 ${
                isAtLastWindow ? "rotate-90" : "-rotate-90"
              }`}
            />
          </button>
        ) : null}
      </div>

      <motion.div
        key={index}
        role="tabpanel"
        className="w-full"
        initial={
          prefersReducedMotion || direction === 0
            ? false
            : { opacity: 0, x: direction * 16 }
        }
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {sections[index] ?? null}
      </motion.div>
    </div>
  );
};
