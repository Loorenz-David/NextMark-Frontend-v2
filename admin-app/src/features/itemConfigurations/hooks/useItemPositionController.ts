import { useMemo, useState } from 'react'

import { filterItemPositions } from '../domain/useItemRules'
import { useItemPositionFlow } from './useItemPositionFlow'
import { useItemPositions } from './useItemSelectors'
import { useItemConfigActions } from './useItemConfigActions'

export const useItemPositionController = () => {
  useItemPositionFlow()
  const items = useItemPositions()
  const actions = useItemConfigActions()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => filterItemPositions(items, query), [items, query])

  return {
    items: filtered,
    query,
    setQuery,
    openCreate: () => actions.openPositionForm('create'),
    openEdit: (clientId: string) => actions.openPositionForm('edit', clientId),
  }
}
