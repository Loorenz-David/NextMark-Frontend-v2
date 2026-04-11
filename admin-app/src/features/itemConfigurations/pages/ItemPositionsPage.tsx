import { ItemSectionLayout } from '../components/ItemSectionLayout'
import { ItemPositionCard } from '../components/ItemPositionCard'
import { useItemPositionController } from '../hooks/useItemPositionController'

export const ItemPositionsPage = () => {
  const { items, query, setQuery, openCreate, openEdit } = useItemPositionController()

  return (
    <ItemSectionLayout
      title="Item Positions"
      description="Manage item positions."
      onCreate={openCreate}
      query={query}
      onSearch={setQuery}
    >
      {items.map((item) => (
        <ItemPositionCard key={item.client_id} item={item} onEdit={openEdit} />
      ))}
      {!items.length ? (
        <p className="text-sm text-[var(--color-muted)]">No item positions found.</p>
      ) : null}
    </ItemSectionLayout>
  )
}
