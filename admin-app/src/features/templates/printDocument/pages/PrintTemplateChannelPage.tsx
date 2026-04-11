import { AnimatePresence, motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { isTemplateChannel } from '../domain/templateChannel.map'
import { templateEventMap } from '../domain/templateEvent.map'
import { usePrintTemplatePageFlow } from '../flows/printTemplatePage.flow'
import { EventCard } from '../components/EventCard'

export const PrintTemplateChannelPage = () => {
  const params = useParams()
  const { templates } = usePrintTemplatePageFlow()



  const channelParam = params.channel
  if (!channelParam || !isTemplateChannel(channelParam)) {
    return (
      <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-5 text-sm text-[var(--color-muted)]">
        Invalid channel.
      </div>
    )
  }

  const channelEvents = Object.values(templateEventMap).filter((event) => event.channel === channelParam)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={channelParam}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col gap-3"
      >
        {channelEvents.length ? (
          channelEvents.map((eventDefinition) => (
            <EventCard
              key={eventDefinition.eventName}
              channel={channelParam}
              templates={templates}
              eventDefinition={eventDefinition}
            />
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/[0.08] bg-white/[0.03] p-5 text-sm text-[var(--color-muted)]">
            No events configured for this channel yet.
          </div>
        )}

       
      </motion.div>
    </AnimatePresence>
  )
}
