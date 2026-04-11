import { useState } from "react";

import { DeleteIcon, EditIcon } from "@/assets/icons";
import { ConfirmActionButton } from "@/shared/buttons/DeleteButton";
import { usePopupManager } from "@/shared/resource-manager/useResourceManager";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

import { useOrderNotesController } from "../controllers/orderNotes.controller";
import {
  canEditOrderNote,
  extractNormalizedNotes,
  NOTE_TYPE_LABEL,
  NOTE_TYPE_STYLE,
  type NormalizedOrderNote,
} from "../domain/orderNotes";
import type { Order } from "../types/order";

type OrderDetailNotesTabProps = {
  order: Order | null;
};

export const OrderDetailNotesTab = ({ order }: OrderDetailNotesTabProps) => {
  const popupManager = usePopupManager();
  const { deleteOrderNote } = useOrderNotesController();
  const notes = extractNormalizedNotes(order?.order_notes);

  return (
    <div
      className="admin-glass-panel flex h-[420px] flex-col overflow-hidden rounded-[26px] border-white/10"
      style={{ boxShadow: "none" }}
    >
      <div className="admin-glass-divider border-b px-5 py-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-muted)]">
          Order Notes
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 py-4.5 scroll-thin">
        {notes.length === 0 ? (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-muted)]">
            No notes available.
          </div>
        ) : (
          notes.map((note) => {
            const style = NOTE_TYPE_STYLE[note.type];

            return (
              <div
                key={note.id}
                className={`rounded-[20px] border px-4 py-3 text-sm relative ${style.container}`}
              >
                <div className="mb-1 flex items-start justify-between gap-3">
                  <p
                    className={`text-[10px] font-medium uppercase tracking-[0.2em] ${style.label}`}
                  >
                    {NOTE_TYPE_LABEL[note.type]}
                  </p>
                  {order?.client_id ? (
                    <OrderNoteActions
                      note={note}
                      onDelete={() => {
                        void deleteOrderNote({
                          clientId: order.client_id,
                          note,
                        });
                      }}
                      onEdit={() => {
                        popupManager.open({
                          key: "order.note.edit",
                          payload: {
                            clientId: order.client_id,
                            noteIndex: note.index,
                            noteType: note.type,
                            noteContent: note.content,
                            noteCreationDate: note.creation_date,
                          },
                        });
                      }}
                    />
                  ) : null}
                </div>
                <p className={`text-sm leading-6 ${style.content}`}>
                  {note.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const OrderNoteActions = ({
  note,
  onEdit,
  onDelete,
}: {
  note: NormalizedOrderNote;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-3 right-3">
      <FloatingPopover
        open={open}
        onOpenChange={setOpen}
        offSetNum={6}
        placement="bottom-end"
        reference={
          <button
            type="button"
            aria-label="Open note actions"
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[var(--color-muted)] transition-colors hover:bg-white/[0.09] hover:text-[var(--color-text)]"
          >
            <span className="flex flex-col items-center justify-center gap-[3px]">
              <span className="h-[3px] w-[3px] rounded-full bg-current" />
              <span className="h-[3px] w-[3px] rounded-full bg-current" />
              <span className="h-[3px] w-[3px] rounded-full bg-current" />
            </span>
          </button>
        }
      >
        <div className="admin-glass-popover w-[180px] rounded-lg border border-[var(--color-border-accent)] p-1 shadow-md">
          {canEditOrderNote(note.type) ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-text)] transition-colors hover:bg-white/[0.08]"
            >
              <EditIcon className="h-4 w-4 stroke-[var(--color-text)]" />
              <span>Edit note</span>
            </button>
          ) : null}
          <ConfirmActionButton
            onConfirm={() => {
              setOpen(false);
              onDelete();
            }}
            deleteClassName="rounded-lg"
            confirmClassName="rounded-lg"
            confirmOverLay="bg-rose-700/90"
            deleteContent={
              <div className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-text)] transition-colors hover:bg-white/[0.08]">
                <DeleteIcon className="h-4 w-4 text-rose-300" />
                <span>Delete note</span>
              </div>
            }
            confirmContent={
              <div className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white">
                <DeleteIcon className="h-4 w-4 text-white" />
                <span>Confirm delete</span>
              </div>
            }
          />
        </div>
      </FloatingPopover>
    </div>
  );
};
