import { useState } from 'react'

import { useFacilityActions } from './useFacilityActions'
import { useFacilitySelectorQuery } from './useFacilitySelectorQuery'

export const useFacilityController = () => {
  const [query, setQuery] = useState('')
  const actions = useFacilityActions()
  const { items, isLoading } = useFacilitySelectorQuery({
    query,
    limit: 25,
    initialLimit: 25,
  })

  return {
    items,
    query,
    setQuery,
    isLoading,
    openCreate: () => actions.openFacilityForm({ mode: 'create' }),
    openEdit: (clientId: string) => actions.openFacilityForm({ mode: 'edit', clientId }),
  }
}
