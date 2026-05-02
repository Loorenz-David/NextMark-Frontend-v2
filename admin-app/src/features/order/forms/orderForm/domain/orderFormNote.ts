export const coerceOrderFormNoteToDraft = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const resolved = coerceOrderFormNoteToDraft(entry);
      if (resolved.trim().length > 0) {
        return resolved;
      }
    }

    return "";
  }

  if (value && typeof value === "object") {
    const typedValue = value as { content?: unknown };
    if (typeof typedValue.content === "string") {
      return typedValue.content;
    }
  }

  if (value == null) {
    return "";
  }

  return String(value);
};

export const normalizeOrderFormNoteForSave = (value: unknown): string[] => {
  const note = coerceOrderFormNoteToDraft(value).trim();
  return note ? [note] : [];
};

type OrderFormNoteType = "GENERAL" | "COSTUMER";

type OrderFormTypedNote = {
  type?: unknown;
  content?: unknown;
  creation_date?: unknown;
  [key: string]: unknown;
};

const normalizeOrderFormNoteType = (value: unknown): OrderFormNoteType | null => {
  const normalized = String(value ?? "").toUpperCase();
  if (normalized === "GENERAL") return "GENERAL";
  if (normalized === "COSTUMER") return "COSTUMER";
  return null;
};

const toNoteEntries = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return [...value];
  if (value == null) return [];
  return [value];
};

const findTypedNoteIndex = (
  entries: unknown[],
  noteType: OrderFormNoteType,
): number =>
  entries.findIndex((entry) => {
    if (!entry || typeof entry !== "object") return false;
    return normalizeOrderFormNoteType((entry as OrderFormTypedNote).type) === noteType;
  });

const removeEntryAtIndex = (entries: unknown[], index: number): unknown[] => {
  if (index < 0 || index >= entries.length) return entries;
  return entries.filter((_, entryIndex) => entryIndex !== index);
};

const upsertTypedNote = (
  entries: unknown[],
  noteType: OrderFormNoteType,
  content: string,
): unknown[] => {
  const trimmed = content.trim();
  const existingIndex = findTypedNoteIndex(entries, noteType);

  if (!trimmed) {
    return removeEntryAtIndex(entries, existingIndex);
  }

  const nextNote: OrderFormTypedNote =
    existingIndex >= 0 && entries[existingIndex] && typeof entries[existingIndex] === "object"
      ? {
          ...(entries[existingIndex] as OrderFormTypedNote),
          type: noteType,
          content: trimmed,
        }
      : {
          type: noteType,
          content: trimmed,
        };

  if (existingIndex >= 0) {
    const nextEntries = [...entries];
    nextEntries[existingIndex] = nextNote;
    return nextEntries;
  }

  return [...entries, nextNote];
};

export const coerceOrderFormNotesToDraft = (value: unknown): {
  generalNote: string;
  customerNote: string;
  sourceNotes: unknown[];
} => {
  const entries = toNoteEntries(value);
  let generalNote = "";
  let customerNote = "";

  for (const entry of entries) {
    if (entry && typeof entry === "object") {
      const typedEntry = entry as OrderFormTypedNote;
      const type = normalizeOrderFormNoteType(typedEntry.type);
      const content = coerceOrderFormNoteToDraft(typedEntry.content).trim();
      if (!content) continue;

      if (type === "GENERAL" && !generalNote) {
        generalNote = content;
      }

      if (type === "COSTUMER" && !customerNote) {
        customerNote = content;
      }
      continue;
    }

    const legacyContent = coerceOrderFormNoteToDraft(entry).trim();
    if (legacyContent && !generalNote) {
      generalNote = legacyContent;
    }
  }

  return {
    generalNote,
    customerNote,
    sourceNotes: entries,
  };
};

export const normalizeOrderFormNotesForSave = ({
  generalNote,
  customerNote,
  sourceNotes,
}: {
  generalNote: unknown;
  customerNote: unknown;
  sourceNotes?: unknown;
}): unknown[] => {
  const normalizedGeneral = coerceOrderFormNoteToDraft(generalNote);
  const normalizedCustomer = coerceOrderFormNoteToDraft(customerNote);
  const baseEntries = toNoteEntries(sourceNotes);

  const withGeneral = upsertTypedNote(baseEntries, "GENERAL", normalizedGeneral);
  return upsertTypedNote(withGeneral, "COSTUMER", normalizedCustomer);
};
