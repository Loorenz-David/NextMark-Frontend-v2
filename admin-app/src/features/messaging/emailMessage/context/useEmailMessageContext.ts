import { useContext } from 'react'

import { EmailMessageContext } from './EmailMessageContext'

export const useEmailMessageContext = () => {
  const context = useContext(EmailMessageContext)
  if (!context) {
    throw new Error('useEmailMessageContext must be used within EmailMessageProvider.')
  }
  return context
}

export const useEmailMessageSectionManager = () => useEmailMessageContext().sectionManager

export const useEmailMessagePopupManager = () => useEmailMessageContext().popupManager
