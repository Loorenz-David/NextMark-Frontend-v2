import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { readClientFormFailure } from '../api/clientFormConfigFailure'
import { usePublishClientFormTerms } from '../api/clientFormTerms.api'
import { isTermsDocumentEmpty, type TermsDocument } from '../domain/termsDocument'

/**
 * Publishing is append-only: it writes a new version row and moves the active
 * flag. Existing versions are never edited, which is what keeps a customer's
 * recorded acceptance provable.
 */
export const usePublishClientFormTermsAction = () => {
  const publishTerms = usePublishClientFormTerms()
  const { showMessage } = useMessageHandler()

  return useCallback(
    async (content: TermsDocument) => {
      if (isTermsDocumentEmpty(content)) {
        showMessage({ status: 400, message: 'Write the terms before publishing a version.' })
        return null
      }

      try {
        const response = await publishTerms(content)
        return response.data ?? null
      } catch (error) {
        console.error('Failed to publish client form terms', error)
        showMessage(readClientFormFailure(error, 'Unable to publish the terms version.'))
        return null
      }
    },
    [publishTerms, showMessage],
  )
}
