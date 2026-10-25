import { useEffect, useState, type RefObject } from "react";

/** Live content-box width of an element, or `null` until it has been measured. */
export const useElementWidth = (ref: RefObject<HTMLElement | null>): number | null => {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const next = Math.round(element.getBoundingClientRect().width);
      setWidth((current) => (current === next ? current : next));
    };
    update();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
};
