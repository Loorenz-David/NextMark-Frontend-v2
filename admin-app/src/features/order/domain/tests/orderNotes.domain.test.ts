import {
  extractNormalizedNotes,
  NOTE_TYPE_LABEL,
  normalizeOrderNotesForStore,
} from "../orderNotes";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runOrderNotesDomainTests = () => {
  assert(
    extractNormalizedNotes(null).length === 0,
    "null notes should normalize to an empty list",
  );
  assert(
    extractNormalizedNotes(["", "   ", null, 12]).length === 0,
    "blank and malformed notes should be discarded",
  );

  const legacyNotes = extractNormalizedNotes("  Legacy delivery note  ");
  assert(legacyNotes.length === 1, "a legacy string note should be retained");
  assert(
    legacyNotes[0]?.type === "GENERAL",
    "a legacy string note should normalize to general",
  );
  assert(
    legacyNotes[0]?.content === "Legacy delivery note",
    "legacy note content should be trimmed",
  );

  const typedNotes = extractNormalizedNotes([
    { type: "GENERAL", content: " General " },
    { type: "FAILURE", content: " First failure " },
    { type: "COSTUMER", content: " Customer " },
    { type: "FAILURE", content: " Second failure " },
    { type: "UNKNOWN", content: " Fallback general " },
    { type: "GENERAL", content: " " },
    { type: "FAILURE", content: 99 },
  ]);

  assert(typedNotes.length === 5, "all valid typed notes should be retained");
  assert(
    typedNotes.map((note) => note.type).join(",") ===
      "FAILURE,FAILURE,COSTUMER,GENERAL,GENERAL",
    "notes should follow failure, customer, general priority",
  );
  assert(
    typedNotes[0]?.content === "First failure" &&
      typedNotes[1]?.content === "Second failure",
    "multiple notes of the same type should be retained in source order",
  );
  assert(
    typedNotes[4]?.content === "Fallback general",
    "unknown typed notes should retain the existing general fallback",
  );
  assert(
    NOTE_TYPE_LABEL.COSTUMER === "Customer Note",
    "the customer note label should use the correct spelling",
  );

  const storeNotes = normalizeOrderNotesForStore([
    { type: "general", content: " Updated general note " },
    { type: "COSTUMER", content: " Updated customer note " },
    { type: "FAILURE", content: " Failure note ", creation_date: "2026-07-25" },
    "",
    null,
  ]);
  const firstStoreNote = storeNotes?.[0];
  const lastStoreNote = storeNotes?.[2];

  assert(
    Array.isArray(storeNotes) && storeNotes.length === 3,
    "store normalization should retain every valid typed note",
  );
  assert(
    typeof firstStoreNote === "object" &&
      firstStoreNote.type === "GENERAL" &&
      firstStoreNote.content === "Updated general note",
    "store normalization should preserve typed notes and trim their content",
  );
  assert(
    typeof lastStoreNote === "object" &&
      lastStoreNote.creation_date === "2026-07-25",
    "store normalization should preserve typed note creation dates",
  );
};
