import { useState } from 'react'

import { useVehicleActions } from './useVehicleActions'
import { useVehicleSelectorQuery } from './useVehicleSelectorQuery'

export const useVehicleController = () => {
  const [query, setQuery] = useState('')
  const actions = useVehicleActions()
  const { items, isLoading } = useVehicleSelectorQuery({
    query,
    limit: 25,
    initialLimit: 25,
  })

  return {
    items,
    query,
    setQuery,
    isLoading,
    openCreate: () => actions.openVehicleForm({ mode: 'create' }),
    openEdit: (clientId: string) => actions.openVehicleForm({ mode: 'edit', clientId }),
  }
}
