import type { Order } from "../types/order";

export type NormalizedNoteType = "FAILURE" | "COSTUMER" | "GENERAL";

export type NormalizedOrderNote = {
  id: string;
  index: number;
  type: NormalizedNoteType;
  content: string;
  creation_date: string | null;
};

export const NOTE_TYPE_PRIORITY: Record<NormalizedNoteType, number> = {
  FAILURE: 0,
  COSTUMER: 1,
  GENERAL: 2,
};

export const NOTE_TYPE_LABEL: Record<NormalizedNoteType, string> = {
  FAILURE: "Failure Note",
  COSTUMER: "Costumer Note",
  GENERAL: "General Note",
};

export const NOTE_TYPE_STYLE: Record<
  NormalizedNoteType,
  {
    container: string;
    label: string;
    content: string;
  }
> = {
  FAILURE: {
    container:
      "border-rose-300/25 bg-[linear-gradient(135deg,rgba(251,113,133,0.16),rgba(251,113,133,0.04))]",
    label: "text-rose-200/80",
    content: "text-rose-50/95",
  },
  COSTUMER: {
    container:
      "border-amber-300/25 bg-[linear-gradient(135deg,rgba(255,201,71,0.14),rgba(255,201,71,0.04))]",
    label: "text-amber-200/75",
    content: "text-amber-50/95",
  },
  GENERAL: {
    container:
      "border-cyan-300/25 bg-[linear-gradient(135deg,rgba(56,189,248,0.15),rgba(56,189,248,0.05))]",
    label: "text-cyan-200/80",
    content: "text-cyan-50/95",
  },
};

export const normalizeNoteType = (value: unknown): NormalizedNoteType => {
  const normalized = String(value ?? "").toUpperCase();
  if (normalized === "FAILURE") return "FAILURE";
  if (normalized === "COSTUMER") return "COSTUMER";
  return "GENERAL";
};

export const extractNormalizedNotes = (
  notes: Order["order_notes"] | unknown,
): NormalizedOrderNote[] => {
  const noteEntries = Array.isArray(notes)
    ? notes
    : notes != null
      ? [notes]
      : [];

  return noteEntries
    .map((note, index): NormalizedOrderNote | null => {
      if (typeof note === "string") {
        const content = note.trim();
        if (!content) return null;
        return {
          id: `legacy-${index}`,
          index,
          type: "GENERAL",
          content,
          creation_date: null,
        };
      }

      if (!note || typeof note !== "object") return null;

      const typedNote = note as { type?: unknown; content?: unknown; creation_date?: unknown };
      const content =
        typeof typedNote.content === "string" ? typedNote.content.trim() : "";
      if (!content) return null;

      return {
        id: `typed-${index}`,
        index,
        type: normalizeNoteType(typedNote.type),
        content,
        creation_date:
          typeof typedNote.creation_date === "string" ? typedNote.creation_date : null,
      };
    })
    .filter((note): note is NormalizedOrderNote => Boolean(note))
    .sort((a, b) => NOTE_TYPE_PRIORITY[a.type] - NOTE_TYPE_PRIORITY[b.type]);
};

export const canEditOrderNote = (type: NormalizedNoteType) =>
  type === "COSTUMER" || type === "GENERAL";

export const toMutableOrderNotes = (notes: Order["order_notes"]): NonNullable<Order["order_notes"]> => {
  if (Array.isArray(notes)) return [...notes];
  if (notes == null) return [];
  return [String(notes)];
};

export const toOrderNotePayload = (
  note: Pick<NormalizedOrderNote, "content">,
  contentOverride?: string,
): string => (contentOverride ?? note.content).trim();

export const replaceOrderNoteAtIndex = (
  notes: Order["order_notes"],
  noteIndex: number,
  nextNote: string,
): NonNullable<Order["order_notes"]> => {
  const nextEntries = toMutableOrderNotes(notes);
  nextEntries[noteIndex] = nextNote;
  return nextEntries;
};

export const removeOrderNoteAtIndex = (
  notes: Order["order_notes"],
  noteIndex: number,
): NonNullable<Order["order_notes"]> | null => {
  const nextEntries = toMutableOrderNotes(notes).filter((_, index) => index !== noteIndex);
  return nextEntries.length > 0 ? nextEntries : null;
};
