/** Phone section switcher entries, in the same order as the desktop carousel slides. */
export const ORDER_DETAIL_MOBILE_SECTIONS = [
  { id: "details", label: "Details" },
  { id: "notes", label: "Notes" },
  { id: "windows", label: "Windows" },
  { id: "history", label: "History" },
] as const;

export type OrderDetailMobileSectionId = (typeof ORDER_DETAIL_MOBILE_SECTIONS)[number]["id"];
