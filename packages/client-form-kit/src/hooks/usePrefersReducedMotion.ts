import { useEffect, useState } from "react";

/**
 * Whether the reader has asked their system to reduce motion.
 *
 * Anything that moves on its own — the carousel, the sidebar rotation — must be
 * off for them entirely, not merely slower: the objection is to unrequested
 * movement, not to its speed.
 */
export const usePrefersReducedMotion = (): boolean => {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(query.matches);

    const handleChange = (event: MediaQueryListEvent) =>
      setPrefersReduced(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
};
