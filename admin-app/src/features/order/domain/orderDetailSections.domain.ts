/** Order detail section switcher entries, in display order. */
export const ORDER_DETAIL_SECTIONS = [
  { id: "details", label: "Details" },
  { id: "notes", label: "Notes" },
  { id: "windows", label: "Windows" },
  { id: "history", label: "History" },
] as const;

export type OrderDetailSectionId = (typeof ORDER_DETAIL_SECTIONS)[number]["id"];

/** Labels visible at once in the section switcher; the rest slide in. */
export const ORDER_DETAIL_SECTIONS_VISIBLE = 3;

/** First visible label so that `index` is on screen, moving as little as possible. */
export const resolveSectionWindowStart = (
  index: number,
  currentStart: number,
  total: number,
  visible: number = ORDER_DETAIL_SECTIONS_VISIBLE,
): number => {
  const maxStart = Math.max(0, total - visible);
  const start = Math.min(Math.max(0, currentStart), maxStart);
  if (index < start) return Math.max(0, index);
  if (index >= start + visible) return Math.min(maxStart, index - visible + 1);
  return start;
};

/** Where the "more" control slides next: forward a page, or back to the start at the end. */
export const nextSectionWindowStart = (
  currentStart: number,
  total: number,
  visible: number = ORDER_DETAIL_SECTIONS_VISIBLE,
): number => {
  const maxStart = Math.max(0, total - visible);
  if (currentStart >= maxStart) return 0;
  return Math.min(maxStart, currentStart + visible);
};
