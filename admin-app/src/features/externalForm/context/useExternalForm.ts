import { useContext } from 'react'

import { ExternalFormContext } from './ExternalForm.context'

export const useExternalForm = () => {
  const context = useContext(ExternalFormContext)

  if (!context) {
    throw new Error('ExternalFormContext is not available. Wrap your app with ExternalFormProvider.')
  }

  return context
}
