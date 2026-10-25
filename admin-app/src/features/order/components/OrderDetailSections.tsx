import { Children, useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { SlidingTabRow } from "@/shared/layout/slidingTabs";

import { ORDER_DETAIL_SECTIONS } from "../domain/orderDetailSections.domain";

type OrderDetailSectionsProps = {
  /** Index into `ORDER_DETAIL_SECTIONS`. */
  initialIndex?: number;
  children: ReactNode;
};

/**
 * The order detail sections block: a tab row as its header (phone, iPad and
 * desktop) above one section at a time. Sections grow to their content so
 * the page is the only thing that scrolls.
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
  const [direction, setDirection] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const selectSection = (nextIndex: number) => {
    setDirection(nextIndex > index ? 1 : -1);
    setIndex(nextIndex);
  };

  return (
    <div className="flex w-full flex-col">
      <SlidingTabRow
        tabs={ORDER_DETAIL_SECTIONS.slice(0, total)}
        activeIndex={index}
        onSelect={selectSection}
        ariaLabel="Order detail sections"
        className="border-b border-border bg-surface-subtle"
      />

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
