import { useMemo, useState } from 'react'

import { filterItemProperties } from '../domain/useItemRules'
import { useItemPropertyFlow } from './useItemPropertyFlow'
import { useItemProperties } from './useItemSelectors'
import { useItemConfigActions } from './useItemConfigActions'

export const useItemPropertyController = () => {
  useItemPropertyFlow()
  const items = useItemProperties()
  const actions = useItemConfigActions()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => filterItemProperties(items, query), [items, query])

  return {
    items: filtered,
    query,
    setQuery,
    openCreate: () => actions.openPropertyForm('create'),
    openEdit: (clientId: string) => actions.openPropertyForm('edit', clientId),
  }
}
