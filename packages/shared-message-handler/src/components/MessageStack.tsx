import { AnimatePresence, motion } from 'framer-motion'

import { MessageCard } from './MessageCard'
import type { ManagedMessage } from '../MessageHandlerContext'

interface MessageStackProps {
  messages: ManagedMessage[]
  onDismiss: (id: string) => void
}

export function MessageStack({ messages, onDismiss }: MessageStackProps) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[999] flex w-full max-w-xl -translate-x-1/2 flex-col gap-3 px-4">
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            layout
          >
            <MessageCard
              createdAt={message.createdAt}
              details={message.details}
              durationMs={message.durationMs}
              message={message.message}
              onDismiss={() => onDismiss(message.id)}
              status={message.status}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
