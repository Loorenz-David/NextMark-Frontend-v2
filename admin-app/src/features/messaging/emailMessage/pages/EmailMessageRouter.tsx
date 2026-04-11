import { AnimatePresence, motion } from 'framer-motion'

import { EmailTemplateEditorPage } from './EmailTemplateEditorPage'
import { EmailTemplateList } from '../components/EmailTemplateList'
import { useEmailMessageContext } from '../context/useEmailMessageContext'

export const EmailMessageRouter = () => {
  const { activeTrigger } = useEmailMessageContext()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeTrigger ? 'editor' : 'list'}
        className="flex w-full flex-col"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {activeTrigger ? <EmailTemplateEditorPage /> : <EmailTemplateList />}
      </motion.div>
    </AnimatePresence>
  )
}
