import { useMemo } from 'react'

import { createRouteSolutionWarningRegistry } from '@/features/local-delivery-orders/domain/routeSolutionWarningRegistry'

export const useRouteSolutionWarningRegistry = () =>
  useMemo(() => createRouteSolutionWarningRegistry(), [])

