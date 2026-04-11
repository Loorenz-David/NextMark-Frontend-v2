import { ItemSectionLayout } from '../components/ItemSectionLayout'
import { ItemTypeCard } from '../components/ItemTypeCard'
import { useItemTypeController } from '../hooks/useItemTypeController'

export const ItemTypesPage = () => {
  const { items, query, setQuery, openCreate, openEdit } = useItemTypeController()

  return (
    <ItemSectionLayout
      title="Item Types"
      description="Manage item classifications."
      onCreate={openCreate}
      query={query}
      onSearch={setQuery}
    >
      {items.map((item) => (
        <ItemTypeCard key={item.client_id} item={item} onEdit={openEdit} />
      ))}
      {!items.length ? (
        <p className="text-sm text-[var(--color-muted)]">No item types found.</p>
      ) : null}
    </ItemSectionLayout>
  )
}
