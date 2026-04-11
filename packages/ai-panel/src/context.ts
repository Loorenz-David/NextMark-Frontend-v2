import { createContext, useContext } from 'react'

import type { AiPanelController } from './types'

export const AiPanelContext = createContext<AiPanelController | null>(null)

export function useAiPanel(): AiPanelController {
  const context = useContext(AiPanelContext)
  if (!context) {
    throw new Error('useAiPanel must be used within an AiPanelProvider')
  }
  return context
}
