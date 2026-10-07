import { useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ChevronDownIcon } from "@/assets/icons";

type OrderFilterDrawerProps = {
  label: string;
  summary: string;
  /** Muted summary when the section is at its default, accent otherwise. */
  isDefault: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * Minimal collapsible section for the order filter panel: a single row with a
 * bottom rule, no card chrome, and a height-animated body.
 */
export const OrderFilterDrawer = ({
  label,
  summary,
  isDefault,
  defaultOpen = false,
  children,
}: OrderFilterDrawerProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-[var(--color-text)]">{label}</span>
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={`truncate text-xs ${
              isDefault
                ? "text-[var(--color-muted)]"
                : "font-medium text-[rgb(var(--color-light-blue-r))]"
            }`}
          >
            {summary}
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.18 }}
            className="flex"
          >
            <ChevronDownIcon className="h-3.5 w-3.5 app-icon" />
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
};
