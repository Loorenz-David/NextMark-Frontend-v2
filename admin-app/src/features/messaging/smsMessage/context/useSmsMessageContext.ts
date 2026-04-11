import { useContext } from 'react'

import { SmsMessageContext } from './SmsMessageContext'

export const useSmsMessageContext = () => {
  const context = useContext(SmsMessageContext)
  if (!context) {
    throw new Error('useSmsMessageContext must be used within SmsMessageProvider.')
  }
  return context
}

export const useSmsMessageSectionManager = () => useSmsMessageContext().sectionManager

export const useSmsMessagePopupManager = () => useSmsMessageContext().popupManager
