import { useEffect, useMemo, useState } from 'react'

import type { Descendant } from 'slate'

import { normalizeTemplateValue, serializeTemplate } from '@/features/templates/utils'

export const useSmsMessageEditor = (initialTemplate?: unknown) => {
  const [value, setValue] = useState<Descendant[]>(() => normalizeTemplateValue(initialTemplate))
  const serialized = useMemo(() => serializeTemplate(value), [value])

  useEffect(() => {
    setValue(normalizeTemplateValue(initialTemplate))
  }, [initialTemplate])

  return { value, setValue, serialized }
}
