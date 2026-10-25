/** Labels visible at once in a sliding tab row; the rest slide in. */
export const SLIDING_TABS_VISIBLE = 3;

/** First visible label so that `index` is on screen, moving as little as possible. */
export const resolveTabWindowStart = (
  index: number,
  currentStart: number,
  total: number,
  visible: number = SLIDING_TABS_VISIBLE,
): number => {
  const maxStart = Math.max(0, total - visible);
  const start = Math.min(Math.max(0, currentStart), maxStart);
  if (index < start) return Math.max(0, index);
  if (index >= start + visible) return Math.min(maxStart, index - visible + 1);
  return start;
};

/** Where the "more" control slides next: forward a page, or back to the start at the end. */
export const nextTabWindowStart = (
  currentStart: number,
  total: number,
  visible: number = SLIDING_TABS_VISIBLE,
): number => {
  const maxStart = Math.max(0, total - visible);
  if (currentStart >= maxStart) return 0;
  return Math.min(maxStart, currentStart + visible);
};
