import {
  Children,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
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
 * The order detail sections block: a tab row as its header (phone, iPad and
 * desktop) above one section at a time. Sections grow to their content so
 * the page is the only thing that scrolls.
 *
 * Labels keep their natural width. At most `ORDER_DETAIL_SECTIONS_VISIBLE`
 * show; the next one peeks through a fade and a chevron slides the row to
 * the rest and back.
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

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [layout, setLayout] = useState<{ viewport: number; tabs: TabRect[] } | null>(null);

  // Labels size to their text, so positions are measured (and re-measured
  // when the panel or the font changes width).
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
    tabRefs.current.forEach((tab) => tab && observer.observe(tab));
    return () => observer.disconnect();
  }, [total]);

  const tabs = layout?.tabs ?? [];
  const lastTab = tabs[total - 1];
  const contentWidth = lastTab ? lastTab.left + lastTab.width : 0;
  const maxOffset = Math.max(0, contentWidth - (layout?.viewport ?? 0));
  // Measured from the first label so the row's own padding is not a slide.
  const windowLeft = (tabs[windowStart]?.left ?? 0) - (tabs[0]?.left ?? 0);
  // A narrow row keeps its last window flush right (the previous label then
  // peeks on the left); a row that fits still slides so only three show.
  const offset = maxOffset > 0 ? Math.min(windowLeft, maxOffset) : windowLeft;
  const isAtStart = offset <= 0;
  const nextHidden = tabs[windowStart + visibleCount];
  // Cut the row a peek past the last visible label, or at the viewport edge.
  const peekEnd = nextHidden ? nextHidden.left - offset + PEEK_PX : null;
  const fadeEndAt =
    hasOverflow && peekEnd !== null
      ? Math.min(peekEnd, layout?.viewport ?? peekEnd)
      : null;
  const isAtEnd = !nextHidden;
  const edgeMask = layout ? buildEdgeMask(hasOverflow && !isAtStart, fadeEndAt) : undefined;
  const isActiveInView = index >= windowStart && index < windowStart + visibleCount;
  const activeTab = tabs[index];

  const selectSection = (nextIndex: number) => {
    if (nextIndex === index) return;
    setDirection(nextIndex > index ? 1 : -1);
    setIndex(nextIndex);
    setWindowStart((current) => resolveSectionWindowStart(nextIndex, current, total));
  };

  const transitionFor = (value: string) =>
    prefersReducedMotion || !layout ? undefined : value;

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-stretch border-b border-border bg-surface-subtle">
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
            aria-label="Order detail sections"
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
            {ORDER_DETAIL_SECTIONS.slice(0, total).map((section, sectionIndex) => {
              const isActive = sectionIndex === index;
              const isInView =
                sectionIndex >= windowStart &&
                sectionIndex < windowStart + visibleCount;
              // Past the peeking label everything is faded out; keep it untappable.
              const isFadedOut = sectionIndex > windowStart + visibleCount;
              return (
                <button
                  key={section.id}
                  ref={(node) => {
                    tabRefs.current[sectionIndex] = node;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isInView ? 0 : -1}
                  onClick={() => selectSection(sectionIndex)}
                  className={`relative min-h-12 shrink-0 cursor-pointer whitespace-nowrap px-2.5 text-px-15 transition-colors duration-200 ${
                    isFadedOut ? "pointer-events-none" : ""
                  } ${
                    isActive
                      ? "font-semibold text-[var(--color-text)]"
                      : "font-medium text-[var(--color-muted)] hover:text-[var(--color-text)]"
                  }`}
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
            aria-label={isAtEnd ? "Show first sections" : "Show more sections"}
            className="touch-hit-area flex w-11 shrink-0 cursor-pointer items-center justify-center text-[var(--color-text)] transition-colors hover:bg-surface-hover"
          >
            <ChevronDownIcon
              className={`h-5 w-5 transition-transform duration-300 ${
                isAtEnd ? "rotate-90" : "-rotate-90"
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
