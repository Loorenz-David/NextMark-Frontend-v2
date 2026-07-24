import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ClientFormMedia } from "../domain/clientFormConfig.types";
import { useAutoAdvancePause } from "../hooks/useAutoAdvancePause";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { ClientFormMediaImage, ClientFormMediaLink } from "./ClientFormMediaImage";

/**
 * Longer than the carousel's dwell: a strip is read in passing, at the edge of
 * attention, and turning it at the pace of something the customer is looking at
 * directly makes the page feel restless.
 */
const ROTATION_INTERVAL_MS = 7000;

type Props = {
  items: ClientFormMedia[];
};

/**
 * A vertical strip beside the form — the skyscraper slot of a printed page.
 *
 * Several items share the one slot and turn over on a timer rather than stacking
 * down the page, which is what the format is: one frame, holding a rotation.
 *
 * Desktop only. There is no room for a rail next to a phone-width form, and the
 * spec is explicit that sidebars are not rendered there — so this collapses to
 * nothing below `lg` rather than reflowing into the reading order.
 *
 * The rail sticks while the form scrolls, which is what makes a strip a strip;
 * the parent row must therefore align its items to the start.
 *
 * Takes its items rather than reading the form context, so it can also run on a
 * screen where no form session exists — an idle counter device, a confirmation
 * screen — where there is media to show but nothing being filled in.
 */
export const ClientFormMediaRail = ({ items }: Props) => {
  const [index, setIndex] = useState(0);
  const { isPaused, pauseProps } = useAutoAdvancePause();
  const prefersReducedMotion = usePrefersReducedMotion();

  const count = items.length;
  const isRotating = count > 1 && !isPaused && !prefersReducedMotion;

  useEffect(() => {
    if (!isRotating) return;

    const intervalId = window.setInterval(
      () => setIndex((current) => (current + 1) % count),
      ROTATION_INTERVAL_MS,
    );
    return () => window.clearInterval(intervalId);
  }, [count, isRotating]);

  if (!count) {
    return null;
  }

  // A config refresh can shorten the list under a index that has already moved
  // past the new end.
  const current = items[index % count];

  return (
    <aside
      className="sticky top-10 hidden w-[11rem] shrink-0 py-10 lg:block xl:w-[13rem]"
      {...pauseProps}
    >
      {/* Fixed frame: the rotation must not resize the column beside it, and an
          item with a caption must occupy exactly what one without it does. */}
      <div className="relative aspect-[2/5] overflow-hidden rounded-[var(--radius)] border border-[var(--rule-strong)] bg-[var(--paper-raised)]">
        <AnimatePresence initial={false}>
          <motion.div
            key={current.id}
            className="absolute inset-0"
            initial={prefersReducedMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.55, ease: "easeInOut" }
            }
          >
            <ClientFormMediaLink media={current} className="block h-full w-full">
              <ClientFormMediaImage
                media={current}
                className="h-full w-full object-cover"
              />

              {current.title ? (
                <p className="absolute inset-x-0 bottom-0 border-t border-[var(--rule)] bg-[var(--paper-raised)] px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                  {current.title}
                </p>
              ) : null}
            </ClientFormMediaLink>
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
};
