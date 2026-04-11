import { useContext } from 'react'

import { IntegrationsContext } from './IntegrationsContext'

export const useIntegrationsContext = () => {
  const context = useContext(IntegrationsContext)
  if (!context) {
    throw new Error('useIntegrationsContext must be used within IntegrationsProvider.')
  }
  return context
}
