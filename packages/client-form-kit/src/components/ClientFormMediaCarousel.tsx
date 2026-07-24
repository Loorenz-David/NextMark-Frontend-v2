import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientFormMedia } from "../domain/clientFormConfig.types";
import { useAutoAdvancePause } from "../hooks/useAutoAdvancePause";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { ClientFormMediaImage, ClientFormMediaLink } from "./ClientFormMediaImage";

const AUTOPLAY_INTERVAL_MS = 5000;

/**
 * The distance from one card to the next, measured rather than assumed — the
 * card width changes with the breakpoint and the gap is a Tailwind class, so
 * neither is a number this file should be holding a copy of.
 */
const getCardStride = (track: HTMLElement): number => {
  const [first, second] = Array.from(track.children) as HTMLElement[];
  if (!first) return 0;
  return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
};

/**
 * A product carousel: the image carries the card, with the title and description
 * beneath it.
 *
 * Scrolling is the browser's own — scroll-snap over an overflow container — so a
 * swipe, a trackpad, a shift-wheel and a keyboard all work without this file
 * implementing any of them. Autoplay is layered on top by scrolling the same
 * container, which means a customer who takes hold of it mid-animation is never
 * fighting a transform.
 *
 * It holds still whenever someone is attending to it (see `useAutoAdvancePause`)
 * and never starts at all for a reader who asked for reduced motion.
 *
 * Takes its items rather than reading the form context, so it can also run where
 * no form session exists — an idle counter device showing what is on offer.
 */
type Props = {
  items: ClientFormMedia[];
};

export const ClientFormMediaCarousel = ({ items }: Props) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { isPaused, pauseProps } = useAutoAdvancePause();
  const prefersReducedMotion = usePrefersReducedMotion();

  const isAutoplayEnabled =
    items.length > 1 && !isPaused && !prefersReducedMotion;

  // The dots follow the container, not the other way round, so manual scrolling
  // and autoplay report position through the same path.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      const stride = getCardStride(track);
      if (!stride) return;
      setActiveIndex(Math.round(track.scrollLeft / stride));
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleScroll);
  }, [items.length]);

  useEffect(() => {
    if (!isAutoplayEnabled) return;

    const intervalId = window.setInterval(() => {
      const track = trackRef.current;
      if (!track) return;

      const stride = getCardStride(track);
      if (!stride) return;

      const next = (Math.round(track.scrollLeft / stride) + 1) % items.length;
      track.scrollTo({ left: next * stride, behavior: "smooth" });
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isAutoplayEnabled, items.length]);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const stride = getCardStride(track);
    track.scrollTo({ left: index * stride, behavior: "smooth" });
  }, []);

  if (!items.length) {
    return null;
  }

  return (
    <section
      aria-label="Featured items"
      className="space-y-4"
      {...pauseProps}
    >
      <div
        ref={trackRef}
        className="client-form-carousel-track flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
      >
        {items.map((item) => (
          <article
            key={item.id}
            className="w-[15rem] shrink-0 snap-start overflow-hidden rounded-[var(--radius)] border border-[var(--rule-strong)] bg-[var(--paper-raised)] sm:w-[16rem]"
          >
            <ClientFormMediaLink media={item} className="block">
              <ClientFormMediaImage
                media={item}
                className="aspect-[4/3] w-full object-cover"
                fallback={
                  <div className="aspect-[4/3] w-full bg-[var(--paper-sunken)]" />
                }
              />

              {item.title || item.description ? (
                <div className="space-y-1.5 border-t border-[var(--rule)] px-4 py-3">
                  {item.title ? (
                    <h3 className="text-[0.95rem] leading-snug text-[var(--ink)]">
                      {item.title}
                    </h3>
                  ) : null}
                  {item.description ? (
                    <p className="text-sm leading-6 text-[var(--ink-soft)]">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </ClientFormMediaLink>
          </article>
        ))}
      </div>

      {items.length > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Go to item ${index + 1}`}
              aria-current={index === activeIndex}
              onClick={() => scrollToIndex(index)}
              className={[
                "h-1.5 cursor-pointer rounded-full transition-all",
                index === activeIndex
                  ? "w-5 bg-[var(--accent)]"
                  : "w-1.5 bg-[var(--rule-strong)] hover:bg-[var(--ink-faint)]",
              ].join(" ")}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};
