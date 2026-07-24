import { ClientFormMediaPlacementGroup } from '../components/ClientFormMediaPlacementGroup'
import { ClientFormSectionLayout } from '../components/ClientFormSectionLayout'
import { ClientFormToggleRow } from '../components/ClientFormToggleRow'
import { useClientFormMediaController } from '../controllers/useClientFormMediaController'
import { useClientFormSettingsController } from '../controllers/useClientFormSettingsController'

export const ClientFormMediaPage = () => {
  const { settings, setFlag } = useClientFormSettingsController()
  const { placements, totalCount, openCreate, openEdit, handleReorder, toggleEnabled, removeMedia } =
    useClientFormMediaController()

  return (
    <ClientFormSectionLayout
      title="Media"
      description="Branding and publicity images, placed at named slots on the form. Ordering is per slot."
      toggles={
        <ClientFormToggleRow
          label="Show media on the form"
          description="Renders every enabled image in its slot."
          value={settings.show_media}
          onChange={(value) => setFlag('show_media', value)}
        />
      }
    >
      {placements.map(({ placement, items }) => (
        <ClientFormMediaPlacementGroup
          key={placement}
          placement={placement}
          items={items}
          onCreate={openCreate}
          onEdit={openEdit}
          onToggleEnabled={toggleEnabled}
          onDelete={removeMedia}
          onReorder={handleReorder}
        />
      ))}

      {totalCount === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          No images configured yet. Add one to any slot above.
        </p>
      ) : null}
    </ClientFormSectionLayout>
  )
}
