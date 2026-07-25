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
  COSTUMER: "Customer Note",
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
      "border-danger-border bg-[linear-gradient(135deg,rgba(var(--danger-rose-r),0.16),rgba(var(--danger-rose-r),0.04))]",
    label: "text-danger",
    content: "text-danger",
  },
  COSTUMER: {
    container:
      "border-warning-border bg-[linear-gradient(135deg,rgba(var(--warning-highlight-r),0.14),rgba(var(--warning-highlight-r),0.04))]",
    label: "text-warning",
    content: "text-warning",
  },
  GENERAL: {
    container:
      "border-info-border bg-[linear-gradient(135deg,rgba(var(--info-r),0.15),rgba(var(--info-r),0.05))]",
    label: "text-info",
    content: "text-info",
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

      const typedNote = note as {
        type?: unknown;
        content?: unknown;
        creation_date?: unknown;
      };
      const content =
        typeof typedNote.content === "string" ? typedNote.content.trim() : "";
      if (!content) return null;

      return {
        id: `typed-${index}`,
        index,
        type: normalizeNoteType(typedNote.type),
        content,
        creation_date:
          typeof typedNote.creation_date === "string"
            ? typedNote.creation_date
            : null,
      };
    })
    .filter((note): note is NormalizedOrderNote => Boolean(note))
    .sort((a, b) => NOTE_TYPE_PRIORITY[a.type] - NOTE_TYPE_PRIORITY[b.type]);
};

type OrderNoteEntry = NonNullable<Order["order_notes"]>[number];

export const normalizeOrderNotesForStore = (
  notes: unknown,
): Order["order_notes"] => {
  const entries = Array.isArray(notes)
    ? notes
    : notes != null
      ? [notes]
      : [];

  const normalized = entries
    .map((note): OrderNoteEntry | null => {
      if (typeof note === "string") {
        const content = note.trim();
        return content || null;
      }

      if (!note || typeof note !== "object") return null;

      const typedNote = note as {
        type?: unknown;
        content?: unknown;
        creation_date?: unknown;
      };
      const content =
        typeof typedNote.content === "string" ? typedNote.content.trim() : "";
      if (!content) return null;

      return {
        type: String(typedNote.type ?? "GENERAL").toUpperCase(),
        content,
        creation_date:
          typeof typedNote.creation_date === "string"
            ? typedNote.creation_date
            : null,
      };
    })
    .filter((note): note is OrderNoteEntry => note != null);

  return normalized.length > 0 ? normalized : null;
};

export const canEditOrderNote = (type: NormalizedNoteType) =>
  type === "COSTUMER" || type === "GENERAL";

export const toMutableOrderNotes = (
  notes: Order["order_notes"],
): NonNullable<Order["order_notes"]> => {
  if (Array.isArray(notes)) return [...notes];
  if (notes == null) return [];
  return [String(notes)];
};

export const toOrderNotePayload = (
  note: Pick<NormalizedOrderNote, "type" | "content">,
  contentOverride?: string,
): { type: string; content: string } => ({
  type: note.type,
  content: (contentOverride ?? note.content).trim(),
});

export const replaceOrderNoteAtIndex = (
  notes: Order["order_notes"],
  noteIndex: number,
  nextNote: { type: string; content: string },
): NonNullable<Order["order_notes"]> => {
  const nextEntries = toMutableOrderNotes(notes);
  nextEntries[noteIndex] = nextNote;
  return nextEntries;
};

export const removeOrderNoteAtIndex = (
  notes: Order["order_notes"],
  noteIndex: number,
): NonNullable<Order["order_notes"]> | null => {
  const nextEntries = toMutableOrderNotes(notes).filter(
    (_, index) => index !== noteIndex,
  );
  return nextEntries.length > 0 ? nextEntries : null;
};
