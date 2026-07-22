import { useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { trustedDeviceApi } from '../api/trustedDeviceApi'
import {
  mapTrustedDeviceList,
  toTrustedDeviceMap,
} from '../domain/trustedDeviceMappers'
import {
  clearTrustedDevices,
  insertTrustedDevices,
  selectAllTrustedDevices,
  useTrustedDeviceStore,
} from '../store/trustedDeviceStore'
import type { TrustedDevice } from '../types/trustedDevice'

type TrustedDeviceListQueryResult = {
  devices: TrustedDevice[]
  isLoading: boolean
  permissionDenied: boolean
}

/**
 * Loads the trusted-device list once on mount. The list endpoint is admin-only,
 * so a 403 surfaces as `permissionDenied` (rendered as a non-error empty state)
 * rather than an error toast.
 */
export const useTrustedDeviceListQuery = (): TrustedDeviceListQueryResult => {
  const devices = useTrustedDeviceStore(useShallow(selectAllTrustedDevices))
  const [isLoading, setIsLoading] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const hasFetchedRef = useRef(false)
  const { showMessage } = useMessageHandler()

  useEffect(() => {
    if (hasFetchedRef.current) {
      return
    }
    hasFetchedRef.current = true

    const controller = new AbortController()
    setIsLoading(true)

    trustedDeviceApi
      .list(controller.signal)
      .then((response) => {
        clearTrustedDevices()
        insertTrustedDevices(
          toTrustedDeviceMap(mapTrustedDeviceList(response.data.trusted_devices)),
        )
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        if (error instanceof ApiError && error.status === 403) {
          setPermissionDenied(true)
          return
        }
        const status = error instanceof ApiError ? error.status : 500
        const message =
          error instanceof ApiError ? error.message : 'Unable to load trusted devices.'
        showMessage({ status, message })
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [showMessage])

  return { devices, isLoading, permissionDenied }
}
