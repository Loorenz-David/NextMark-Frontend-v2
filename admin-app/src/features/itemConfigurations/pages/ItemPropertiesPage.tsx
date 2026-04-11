import { ItemSectionLayout } from '../components/ItemSectionLayout'
import { ItemPropertyCard } from '../components/ItemPropertyCard'
import { useItemPropertyController } from '../hooks/useItemPropertyController'

export const ItemPropertiesPage = () => {
  const { items, query, setQuery, openCreate, openEdit } = useItemPropertyController()

  return (
    <ItemSectionLayout
      title="Item Properties"
      description="Manage item property fields."
      onCreate={openCreate}
      query={query}
      onSearch={setQuery}
    >
      {items.map((item) => (
        <ItemPropertyCard key={item.client_id} item={item} onEdit={openEdit} />
      ))}
      {!items.length ? (
        <p className="text-sm text-[var(--color-muted)]">No item properties found.</p>
      ) : null}
    </ItemSectionLayout>
  )
}
