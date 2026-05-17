import { useEffect, useMemo, useState } from 'react'

import { serializeTemplate } from '@/features/templates/utils'

import { normalizeEmailTemplateValue } from '../domain'
import type { EmailTemplateValue } from '../types'

export const useEmailMessageEditor = (initialTemplate?: unknown) => {
  const [value, setValue] = useState<EmailTemplateValue>(() => normalizeEmailTemplateValue(initialTemplate))
  const serialized = useMemo(() => serializeTemplate(value), [value])

  useEffect(() => {
    setValue(normalizeEmailTemplateValue(initialTemplate))
  }, [initialTemplate])

  return { value, setValue, serialized }
}
