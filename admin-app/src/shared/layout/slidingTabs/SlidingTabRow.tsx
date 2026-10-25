import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";

import { ChevronDownIcon } from "@/assets/icons";

import {
  nextTabWindowStart,
  resolveTabWindowStart,
  SLIDING_TABS_VISIBLE,
} from "./slidingTabWindow.domain";

export type SlidingTab = { id: string | number; label: string };

type SlidingTabRowProps = {
  tabs: readonly SlidingTab[];
  /** Index into `tabs`; `null` when nothing is selected. */
  activeIndex: number | null;
  onSelect: (index: number) => void;
  ariaLabel: string;
  /** Classes for the strip (border, background). */
  className?: string;
  /** Rendered at the end of the strip, after the "more" chevron. */
  trailing?: ReactNode;
};

type TabRect = { left: number; width: number };

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SLIDE_TRANSITION = `transform 280ms ${EASE}`;
const INDICATOR_TRANSITION = `transform 280ms ${EASE}, width 280ms ${EASE}, opacity 200ms ease-out`;
/** How much of the next label shows past the last visible one. */
const PEEK_PX = 32;
const EDGE_FADE_PX = 28;

const buildEdgeMask = (fadeStart: boolean, fadeEndAt: number | null): string | undefined => {
  if (!fadeStart && fadeEndAt === null) return undefined;
  const start = fadeStart ? `transparent 0px, black ${EDGE_FADE_PX}px` : "black 0px";
  const end =
    fadeEndAt === null
      ? "black 100%"
      : `black ${Math.max(0, fadeEndAt - EDGE_FADE_PX)}px, transparent ${fadeEndAt}px`;
  return `linear-gradient(to right, ${start}, ${end})`;
};

/**
 * A tab row with an underline that glides to the active label. Labels keep
 * their natural width. At most `SLIDING_TABS_VISIBLE` show; the next one
 * peeks through a fade and a chevron slides the row to the rest and back.
 */
export const SlidingTabRow = ({
  tabs,
  activeIndex,
  onSelect,
  ariaLabel,
  className = "",
  trailing,
}: SlidingTabRowProps) => {
  const total = tabs.length;
  const visibleCount = Math.min(total, SLIDING_TABS_VISIBLE);
  const hasOverflow = total > visibleCount;

  const [windowStart, setWindowStart] = useState(() =>
    resolveTabWindowStart(activeIndex ?? 0, 0, total),
  );
  // Keep the active label on screen when the selection changes from outside.
  const [trackedActiveIndex, setTrackedActiveIndex] = useState(activeIndex);
  if (trackedActiveIndex !== activeIndex) {
    setTrackedActiveIndex(activeIndex);
    if (activeIndex != null) {
      setWindowStart((current) => resolveTabWindowStart(activeIndex, current, total));
    }
  }
  const prefersReducedMotion = useReducedMotion();

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [layout, setLayout] = useState<{ viewport: number; tabs: TabRect[] } | null>(null);

  // Labels size to their text, so positions are measured (and re-measured
  // when the panel, the font or a label changes width).
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      setLayout({
        viewport: viewport.clientWidth,
        tabs: tabRefs.current
          .slice(0, total)
          .map((tab) => ({ left: tab?.offsetLeft ?? 0, width: tab?.offsetWidth ?? 0 })),
      });
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    tabRefs.current.slice(0, total).forEach((tab) => tab && observer.observe(tab));
    return () => observer.disconnect();
  }, [total]);

  const rects = layout?.tabs ?? [];
  const lastTab = rects[total - 1];
  const contentWidth = lastTab ? lastTab.left + lastTab.width : 0;
  const maxOffset = Math.max(0, contentWidth - (layout?.viewport ?? 0));
  // Measured from the first label so the row's own padding is not a slide.
  const windowLeft = (rects[windowStart]?.left ?? 0) - (rects[0]?.left ?? 0);
  // A narrow row keeps its last window flush right (the previous label then
  // peeks on the left); a row that fits still slides so only three show.
  const offset = maxOffset > 0 ? Math.min(windowLeft, maxOffset) : windowLeft;
  const isAtStart = offset <= 0;
  const nextHidden = rects[windowStart + visibleCount];
  // Cut the row a peek past the last visible label, or at the viewport edge.
  const peekEnd = nextHidden ? nextHidden.left - offset + PEEK_PX : null;
  const fadeEndAt =
    hasOverflow && peekEnd !== null
      ? Math.min(peekEnd, layout?.viewport ?? peekEnd)
      : null;
  const isAtEnd = !nextHidden;
  const edgeMask = layout ? buildEdgeMask(hasOverflow && !isAtStart, fadeEndAt) : undefined;
  const isActiveInView =
    activeIndex != null &&
    activeIndex >= windowStart &&
    activeIndex < windowStart + visibleCount;
  const activeTab = activeIndex != null ? rects[activeIndex] : undefined;

  const transitionFor = (value: string) =>
    prefersReducedMotion || !layout ? undefined : value;

  return (
    <div className={`flex items-stretch ${className}`}>
      <div
        ref={viewportRef}
        className="relative min-w-0 flex-1 overflow-hidden"
        style={
          edgeMask
            ? ({ maskImage: edgeMask, WebkitMaskImage: edgeMask } as CSSProperties)
            : undefined
        }
      >
        <div
          role="tablist"
          aria-label={ariaLabel}
          className="relative flex w-max gap-1 px-2"
          style={{
            transform: `translateX(-${offset}px)`,
            transition: transitionFor(SLIDE_TRANSITION),
          }}
        >
          {activeTab ? (
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-0.5 rounded-full bg-[var(--color-text)]"
              style={{
                width: activeTab.width,
                transform: `translateX(${activeTab.left}px)`,
                opacity: isActiveInView ? 1 : 0,
                transition: transitionFor(INDICATOR_TRANSITION),
              }}
            />
          ) : null}
          {tabs.map((tab, tabIndex) => {
            const isActive = tabIndex === activeIndex;
            const isInView =
              tabIndex >= windowStart && tabIndex < windowStart + visibleCount;
            // Past the peeking label everything is faded out; keep it untappable.
            const isFadedOut = tabIndex > windowStart + visibleCount;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[tabIndex] = node;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isInView ? 0 : -1}
                onClick={() => {
                  if (!isActive) onSelect(tabIndex);
                }}
                className={`relative min-h-12 shrink-0 cursor-pointer whitespace-nowrap px-2.5 text-px-15 transition-colors duration-200 ${
                  isFadedOut ? "pointer-events-none" : ""
                } ${
                  isActive
                    ? "font-semibold text-[var(--color-text)]"
                    : "font-medium text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {hasOverflow ? (
        <button
          type="button"
          onClick={() =>
            setWindowStart((current) => nextTabWindowStart(current, total))
          }
          aria-label={isAtEnd ? "Show first tabs" : "Show more tabs"}
          className="flex w-11 shrink-0 cursor-pointer items-center justify-center text-[var(--color-text)] transition-colors hover:bg-surface-hover"
        >
          <ChevronDownIcon
            className={`h-5 w-5 transition-transform duration-300 ${
              isAtEnd ? "rotate-90" : "-rotate-90"
            }`}
          />
        </button>
      ) : null}
      {trailing}
    </div>
  );
};
