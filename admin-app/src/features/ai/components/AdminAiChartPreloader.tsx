import { useEffect } from 'react'

import { useAiPanel } from '@nextmark/ai-panel'

import { preloadAiAnalyticsBarList } from './renderAdminAiBlock'

export function AdminAiChartPreloader() {
  const { isOpen } = useAiPanel()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    void preloadAiAnalyticsBarList()
  }, [isOpen])

  return null
}
