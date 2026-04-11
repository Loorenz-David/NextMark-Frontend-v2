import type { IntegrationView } from '../context/IntegrationsContext'
import type { IntegrationKey } from '../types/integration'

import { IntegrationCard } from './IntegrationCard'

type IntegrationsCarouselProps = {
  integrations: IntegrationView[]
  onAdd: (key: IntegrationKey) => void
  onEdit: (key: IntegrationKey, integrationId: number | null) => void
  onRemove: (key: IntegrationKey, integrationId: number | null) => void
}

export const IntegrationsCarousel = ({
  integrations,
  onAdd,
  onEdit,
  onRemove,
}: IntegrationsCarouselProps) => (
  <section className="admin-glass-panel-strong flex min-h-[420px] w-full overflow-hidden rounded-[28px] shadow-none">
    <div className='flex w-full gap-8 overflow-x-auto px-6 py-8'>
      {integrations.map(({ definition }) => (
        <IntegrationCard
          key={definition.key}
          definition={definition}
          isActive={definition.isActive}
          onAdd={() => onAdd(definition.key)}
          onEdit={() => onEdit(definition.key, definition.id)}
          onRemove={() => onRemove(definition.key, definition.id)}
        />
      ))}
    </div>
  </section>
)
