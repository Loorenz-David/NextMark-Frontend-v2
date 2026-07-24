import { useMemo, useState } from "react";
import type { DOMAttributes } from "react";

export type AutoAdvancePauseProps = Pick<
  DOMAttributes<HTMLElement>,
  | "onMouseEnter"
  | "onMouseLeave"
  | "onFocusCapture"
  | "onBlurCapture"
  | "onPointerDown"
  | "onPointerUp"
  | "onPointerCancel"
>;

/**
 * Holds self-advancing media still while someone is plainly attending to it.
 *
 * Pausing on hover is not a courtesy here — these items carry links. Rotating
 * out from under a cursor that is on its way to a click sends the customer to
 * whichever URL happened to arrive, which is a worse failure than a carousel
 * that sits still for a moment.
 *
 * Focus covers the same ground for the keyboard, and a held pointer covers a
 * touch scroll in progress, where there is no hover to read.
 */
export const useAutoAdvancePause = () => {
  const [isPaused, setIsPaused] = useState(false);

  const pauseProps = useMemo<AutoAdvancePauseProps>(
    () => ({
      onMouseEnter: () => setIsPaused(true),
      onMouseLeave: () => setIsPaused(false),
      onFocusCapture: () => setIsPaused(true),
      onBlurCapture: () => setIsPaused(false),
      onPointerDown: () => setIsPaused(true),
      onPointerUp: () => setIsPaused(false),
      onPointerCancel: () => setIsPaused(false),
    }),
    [],
  );

  return { isPaused, pauseProps };
};
