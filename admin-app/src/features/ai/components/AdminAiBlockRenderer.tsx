import type { AiBlockRendererProps } from '@nextmark/ai-panel'

import { useAiOrderRowClick } from '../controllers/useAiOrderRowClick.controller'
import { renderAdminAiBlock } from './renderAdminAiBlock'

export function AdminAiBlockRenderer(props: AiBlockRendererProps) {
  const onOrderRowClick = useAiOrderRowClick()

  return renderAdminAiBlock(props, { onOrderRowClick })
}
