import { useMemo, useState } from 'react'

import { filterItemTypes } from '../domain/useItemRules'
import { useItemTypeFlow } from './useItemTypeFlow'
import { useItemTypes } from './useItemSelectors'
import { useItemConfigActions } from './useItemConfigActions'

export const useItemTypeController = () => {
  useItemTypeFlow()
  const items = useItemTypes()
  const actions = useItemConfigActions()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => filterItemTypes(items, query), [items, query])

  return {
    items: filtered,
    query,
    setQuery,
    openCreate: () => actions.openTypeForm('create'),
    openEdit: (clientId: string) => actions.openTypeForm('edit', clientId),
  }
}
