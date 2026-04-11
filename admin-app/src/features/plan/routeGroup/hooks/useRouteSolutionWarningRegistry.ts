import { useMemo } from 'react'

import { createRouteSolutionWarningRegistry } from '@/features/plan/routeGroup/domain/routeSolutionWarningRegistry'

export const useRouteSolutionWarningRegistry = () =>
  useMemo(() => createRouteSolutionWarningRegistry(), [])

