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
