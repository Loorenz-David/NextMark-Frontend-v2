import { DndContext, closestCenter } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { SearchBar } from '@/shared/buttons/SearchBar'

import { ClientFormRuleCard } from '../components/ClientFormRuleCard'
import { ClientFormSectionLayout } from '../components/ClientFormSectionLayout'
import { ClientFormToggleRow } from '../components/ClientFormToggleRow'
import { SortableClientFormRow } from '../components/SortableClientFormRow'
import { useClientFormRulesController } from '../controllers/useClientFormRulesController'
import { useClientFormSettingsController } from '../controllers/useClientFormSettingsController'

export const ClientFormRulesPage = () => {
  const { settings, setFlag } = useClientFormSettingsController()
  const {
    rules,
    isReorderEnabled,
    query,
    setQuery,
    openCreate,
    openEdit,
    handleReorder,
    toggleEnabled,
    removeRule,
  } = useClientFormRulesController()

  return (
    <ClientFormSectionLayout
      title="Rules"
      description="How your deliveries work, explained to the customer on the form. Drag to change the order they appear in."
      createLabel="Create rule"
      onCreate={openCreate}
      toggles={
        <ClientFormToggleRow
          label="Show rules on the form"
          description="Renders the rules section for customers filling in the form."
          value={settings.show_rules}
          onChange={(value) => setFlag('show_rules', value)}
        />
      }
      headerExtra={
        <SearchBar
          onChange={(value) => setQuery(value.input ?? '')}
          className="w-full rounded-full border border-[var(--color-border)]/70 bg-surface-raised px-3 py-2 text-sm"
          placeholder="Search rules"
        />
      }
    >
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={(event) => {
          if (!event.over) {
            return
          }
          handleReorder(String(event.active.id), String(event.over.id))
        }}
      >
        <SortableContext
          items={rules.map((rule) => rule.client_id)}
          strategy={verticalListSortingStrategy}
        >
          {rules.map((rule) => (
            <SortableClientFormRow
              key={rule.client_id}
              id={rule.client_id}
              disabled={!isReorderEnabled}
            >
              {(dragHandle) => (
                <ClientFormRuleCard
                  rule={rule}
                  dragHandle={dragHandle}
                  onEdit={openEdit}
                  onToggleEnabled={toggleEnabled}
                  onDelete={removeRule}
                />
              )}
            </SortableClientFormRow>
          ))}
        </SortableContext>
      </DndContext>

      {!rules.length ? (
        <p className="text-sm text-[var(--color-muted)]">
          {query.trim() ? 'No rules match that search.' : 'No rules yet.'}
        </p>
      ) : null}

      {!isReorderEnabled && rules.length ? (
        <p className="text-xs text-[var(--color-muted)]/70">
          Clear the search to reorder — a reorder has to send the complete list.
        </p>
      ) : null}
    </ClientFormSectionLayout>
  )
}
