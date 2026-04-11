import { AnimatePresence, motion } from 'framer-motion'

import { SmsTemplateEditorPage } from './SmsTemplateEditorPage'
import { SmsTemplateList } from '../components/SmsTemplateList'
import { useSmsMessageContext } from '../context/useSmsMessageContext'

export const SmsMessageRouter = () => {
  const { activeTrigger } = useSmsMessageContext()

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
        {activeTrigger ? <SmsTemplateEditorPage /> : <SmsTemplateList />}
      </motion.div>
    </AnimatePresence>
  )
}
