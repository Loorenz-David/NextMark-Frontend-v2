import { useEffect } from 'react'

import { usePrintTemplates } from '../store'
import { usePrintTemplateFlow } from './printTemplate.flow'

export const usePrintTemplatePageFlow = () => {
  const { loadAllPrintTemplate } = usePrintTemplateFlow()
  const templates = usePrintTemplates()

  useEffect(() => {
    void loadAllPrintTemplate()
  }, [])

  return {
    templates,
  }
}
