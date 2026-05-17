import { useCallback, useMemo, useState } from 'react'
import type { Descendant } from 'slate'

import { usePreviewEmailMessage } from '../api'
import type { EmailTemplateValue } from '../types'

const DEFAULT_MOCK_DATA = {
  customer_name: 'John Doe',
  tracking_url: 'https://example.com/track/ABC123',
}

export const useEmailTemplatePreview = () => {
  const previewRequest = usePreviewEmailMessage()
  const [html, setHtml] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const refreshPreview = useCallback(
    async (value: EmailTemplateValue, subject?: Descendant[]) => {
      setIsLoading(true)
      try {
        const response = await previewRequest({
          ...value,
          subject,
          mockData: DEFAULT_MOCK_DATA,
        })
        setHtml(response.data?.html ?? '')
      } catch {
        setHtml('')
      } finally {
        setIsLoading(false)
      }
    },
    [previewRequest],
  )

  return useMemo(
    () => ({
      previewHtml: html,
      isPreviewLoading: isLoading,
      refreshPreview,
    }),
    [html, isLoading, refreshPreview],
  )
}
