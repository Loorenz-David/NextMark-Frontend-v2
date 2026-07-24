import { DndContext, closestCenter } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import {
  MEDIA_PLACEMENT_DESCRIPTIONS,
  MEDIA_PLACEMENT_LABELS,
  type MediaPlacement,
} from '../domain/mediaPlacement'
import type { ClientFormMedia } from '../types/clientFormMedia'
import { ClientFormMediaCard } from './ClientFormMediaCard'
import { SortableClientFormRow } from './SortableClientFormRow'

type ClientFormMediaPlacementGroupProps = {
  placement: MediaPlacement
  items: ClientFormMedia[]
  onCreate: (placement: MediaPlacement) => void
  onEdit: (clientId: string) => void
  onToggleEnabled: (media: ClientFormMedia, enabled: boolean) => void
  onDelete: (media: ClientFormMedia) => void
  onReorder: (placement: MediaPlacement, activeClientId: string, overClientId: string) => void
}

export const ClientFormMediaPlacementGroup = ({
  placement,
  items,
  onCreate,
  onEdit,
  onToggleEnabled,
  onDelete,
  onReorder,
}: ClientFormMediaPlacementGroupProps) => (
  <section className="flex flex-col gap-3 rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-4">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          {MEDIA_PLACEMENT_LABELS[placement]}
        </h3>
        <p className="text-xs text-[var(--color-muted)]">
          {MEDIA_PLACEMENT_DESCRIPTIONS[placement]}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onCreate(placement)}
        className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        Add image
      </button>
    </div>

    {items.length ? (
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={(event) => {
          if (!event.over) {
            return
          }
          onReorder(placement, String(event.active.id), String(event.over.id))
        }}
      >
        <SortableContext
          items={items.map((item) => item.client_id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <SortableClientFormRow key={item.client_id} id={item.client_id}>
                {(dragHandle) => (
                  <ClientFormMediaCard
                    media={item}
                    dragHandle={dragHandle}
                    onEdit={onEdit}
                    onToggleEnabled={onToggleEnabled}
                    onDelete={onDelete}
                  />
                )}
              </SortableClientFormRow>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    ) : (
      <p className="py-2 text-xs text-[var(--color-muted)]/70">No images in this slot yet.</p>
    )}
  </section>
)
