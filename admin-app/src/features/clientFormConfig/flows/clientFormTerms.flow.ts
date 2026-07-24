import { useCallback, useEffect, useState } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { usePublishClientFormTermsAction } from '../actions/publishClientFormTerms.action'
import { readClientFormFailure } from '../api/clientFormConfigFailure'
import { useGetClientFormTerms } from '../api/clientFormTerms.api'
import { mapTermsVersionMap } from '../api/clientFormTerms.mapper'
import type { TermsDocument } from '../domain/termsDocument'
import { replaceClientFormTermsVersions } from '../store/clientFormTerms.store'

/**
 * Terms history is deliberately absent from bootstrap — it grows unbounded — so
 * it loads when the editor opens. Publishing re-reads it because the new
 * `version_number` and the moved active flag are both server-assigned.
 */
export const useClientFormTermsFlow = () => {
  const getTerms = useGetClientFormTerms()
  const publishTerms = usePublishClientFormTermsAction()
  const { showMessage } = useMessageHandler()
  const [isLoading, setIsLoading] = useState(true)

  const loadTerms = useCallback(async () => {
    try {
      const response = await getTerms()
      const versions = response.data?.client_form_terms_versions
      if (!versions) {
        showMessage({ status: 500, message: 'Missing client form terms response.' })
        return null
      }
      const mapped = mapTermsVersionMap(versions)
      replaceClientFormTermsVersions(mapped)
      return mapped
    } catch (error) {
      console.error('Failed to load client form terms', error)
      showMessage(readClientFormFailure(error, 'Unable to load the terms history.'))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getTerms, showMessage])

  const publishVersion = useCallback(
    async (content: TermsDocument) => {
      const published = await publishTerms(content)
      if (!published) {
        return null
      }
      await loadTerms()
      showMessage({ status: 200, message: `Version ${published.version_number} published.` })
      return published
    },
    [loadTerms, publishTerms, showMessage],
  )

  useEffect(() => {
    void loadTerms()
  }, [loadTerms])

  return { loadTerms, publishVersion, isLoading }
}
