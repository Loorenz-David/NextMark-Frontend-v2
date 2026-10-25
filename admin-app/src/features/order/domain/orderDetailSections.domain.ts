/** Order detail section switcher entries, in display order. */
export const ORDER_DETAIL_SECTIONS = [
  { id: "details", label: "Details" },
  { id: "notes", label: "Notes" },
  { id: "windows", label: "Windows" },
  { id: "history", label: "History" },
] as const;

export type OrderDetailSectionId = (typeof ORDER_DETAIL_SECTIONS)[number]["id"];
