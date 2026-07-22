import { useMemo, useState } from 'react'

import { filterTrustedDevices } from '../domain/trustedDeviceQuery'
import { useIsTrustedDeviceAdmin } from '../domain/isAdmin'
import { useTrustedDeviceActions } from './useTrustedDeviceActions'
import { useTrustedDeviceListQuery } from './useTrustedDeviceListQuery'

export const useTrustedDeviceController = () => {
  const [query, setQuery] = useState('')
  const { devices, isLoading, permissionDenied } = useTrustedDeviceListQuery()
  const { openEnroll, openReprovision, deleteDevice, rotateSecret } =
    useTrustedDeviceActions()
  const isAdmin = useIsTrustedDeviceAdmin()

  const items = useMemo(() => filterTrustedDevices(devices, query), [devices, query])

  return {
    items,
    query,
    setQuery,
    isLoading,
    permissionDenied,
    isAdmin,
    openEnroll,
    openReprovision,
    deleteDevice,
    rotateSecret,
  }
}
