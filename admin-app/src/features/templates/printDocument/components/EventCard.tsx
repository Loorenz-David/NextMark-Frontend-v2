import { useNavigate } from 'react-router-dom'

import type { TemplateEventDefinition } from '../domain/templateEvent.map'
import { selectTemplateByEventAndChannel } from '../store'
import type { availableChannels, PrintTemplate } from '../types'

type EventCardProps = {
  channel: availableChannels
  templates: PrintTemplate[]
  eventDefinition: TemplateEventDefinition
}

export const EventCard = ({ channel, templates, eventDefinition }: EventCardProps) => {
  const navigate = useNavigate()

  const template = selectTemplateByEventAndChannel(eventDefinition.eventName, channel, templates)
  const status = !template ? 'Not configured' : template.enable ? 'Enabled' : 'Disabled'

  return (
    <button
      type="button"
      onClick={() => navigate(`/settings/print-templates/${channel}/${eventDefinition.eventName}`)}
      className="w-full cursor-pointer rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-5 text-left transition-colors hover:border-[rgb(var(--color-light-blue-r),0.24)] hover:bg-white/[0.05]"
    >
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-[var(--color-text)]">{eventDefinition.title}</h4>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-xs text-[var(--color-muted)]">
          {status}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">{eventDefinition.description}</p>
    </button>
  )
}
