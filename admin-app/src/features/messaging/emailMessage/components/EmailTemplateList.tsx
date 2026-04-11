import { SearchBar } from '@/shared/buttons/SearchBar'

import { TemplateTriggerCard } from '../../components/TemplateEventCard'
import { useEmailMessageContext } from '../context/useEmailMessageContext'

export const EmailTemplateList = () => {
  const { filteredTriggers, setSearchQuery, setActiveTrigger } = useEmailMessageContext()

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex shrink-0 w-full flex-col gap-4 border-b border-[var(--color-border)]/70 px-6 py-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-[var(--color-text)]">Email Template Triggers</h2>
          <p className="text-sm text-[var(--color-muted)]">Compose email templates with dynamic labels.</p>
        </div>
        <SearchBar
          onChange={(value) => setSearchQuery(value.input ?? '')}
          placeholder="Search template triggers..."
          className="w-full rounded-full border border-[var(--color-border)]/70 bg-white/[0.04] px-3 py-2"
        />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="grid h-full w-full auto-rows-max gap-x-4 gap-y-4 overflow-y-auto scroll-thin px-6 py-6 xl:grid-cols-2">
          {filteredTriggers.map(({ trigger, status }) => (
            <TemplateTriggerCard
              key={trigger.key}
              title={trigger.label}
              description={trigger.description}
              status={status}
              onSelect={() => setActiveTrigger(trigger)}
            />
          ))}
          {!filteredTriggers.length ? (
            <div className="col-span-full rounded-[24px] border border-dashed border-white/[0.08] bg-white/[0.03] px-6 py-10 text-center text-sm text-[var(--color-muted)]">
              No email template triggers matched your search.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
