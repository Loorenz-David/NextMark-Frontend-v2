import {
  extractNormalizedNotes,
  NOTE_TYPE_LABEL,
  NOTE_TYPE_STYLE,
} from "../../domain/orderNotes";
import type { Order } from "../../types/order";

type OrderCardNotesTrayProps = {
  notes: Order["order_notes"];
};

export const OrderCardNotesTray = ({
  notes,
}: OrderCardNotesTrayProps) => {
  const normalizedNotes = extractNormalizedNotes(notes);

  if (normalizedNotes.length === 0) return null;

  return (
    <div className="relative z-0 mx-3 -mt-1 overflow-hidden rounded-b-lg border-x border-b border-border-subtle bg-surface-subtle pt-1 shadow-[var(--shadow-panel-state-soft)] transition-colors group-hover:border-border-accent">
      {normalizedNotes.map((note) => {
        const style = NOTE_TYPE_STYLE[note.type];

        return (
          <div
            key={note.id}
            className={`border-t px-3 py-2 ${style.container}`}
          >
            <p
              className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${style.label}`}
            >
              {NOTE_TYPE_LABEL[note.type]}
            </p>
            <p
              className={`mt-0.5 line-clamp-2 text-xs leading-4 ${style.content}`}
              title={note.content}
            >
              {note.content}
            </p>
          </div>
        );
      })}
    </div>
  );
};
