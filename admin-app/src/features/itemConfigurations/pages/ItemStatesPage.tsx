import { DndContext, closestCenter } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'

import { useReloadBlocker } from '@/app/version'
import { useAppDragSensors } from '@/shared/dnd/useAppDragSensors'

import { ItemSectionLayout } from '../components/ItemSectionLayout'
import { ItemStateCard } from '../components/ItemStateCard'
import { useItemStateController } from '../hooks/useItemStateController'
import type { ItemState } from '../types/itemState'

const SortableItemStateCard = ({ item, onEdit }: { item: ItemState; onEdit: (clientId: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(item.id ?? item.client_id),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    cursor: 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} className="dnd-touch-source" {...attributes} {...listeners}>
      <ItemStateCard item={item} onEdit={onEdit} />
    </div>
  )
}

export const ItemStatesPage = () => {
  const { items, userStates, openCreate, openEdit, handleReorder } = useItemStateController()
  const sortableSensors = useAppDragSensors()
  const isReorderEnabled = true
  const [isSorting, setIsSorting] = useState(false)
  useReloadBlocker(isSorting, 'item-states-sort')
  const userStateIds = userStates.map((state) => String(state.id ?? state.client_id))

  return (
    <ItemSectionLayout
      title="Item States"
      description="Manage item workflow states."
      onCreate={openCreate}
      showSearch={false}
      bodyClassName={"flex h-full flex-col items-center justify-start gap-4 bg-[var(--color-page)]/30 p-4 pt-6"}
    >
      {isReorderEnabled ? (
        <DndContext
          sensors={sortableSensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={() => setIsSorting(true)}
          onDragCancel={() => setIsSorting(false)}
          onDragEnd={(event) => {
            setIsSorting(false)
            if (!event.over) {
              return
            }
            handleReorder(String(event.active.id), String(event.over.id))
          }}
        >
          <SortableContext items={userStateIds} strategy={verticalListSortingStrategy}>

              {items.map((item) =>
                item.is_system ? (
                  <ItemStateCard key={item.client_id} item={item} onEdit={openEdit} />
                ) : (
                  <SortableItemStateCard key={item.client_id} item={item} onEdit={openEdit} />
                ),
              )}

          </SortableContext>
        </DndContext>
      ) : (
        items.map((item) => <ItemStateCard key={item.client_id} item={item} onEdit={openEdit} />)
      )}
      {!items.length ? (
        <p className="text-sm text-[var(--color-muted)]">No item states found.</p>
      ) : null}
    </ItemSectionLayout>
  )
}
