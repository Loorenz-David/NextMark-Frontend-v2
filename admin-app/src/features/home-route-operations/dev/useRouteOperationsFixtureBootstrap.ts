import { useEffect, useRef } from 'react'

import { seedCanonicalRouteOperationsScenario } from '@/features/plan/dev/fixtures'

import { isRouteOperationsFixtureModeEnabled } from './routeOperationsFixtureMode'

export const useRouteOperationsFixtureBootstrap = () => {
  const hasSeededRef = useRef(false)
  const isFixtureMode = isRouteOperationsFixtureModeEnabled()

  useEffect(() => {
    if (!isFixtureMode || hasSeededRef.current) {
      return
    }

    seedCanonicalRouteOperationsScenario()
    hasSeededRef.current = true
  }, [isFixtureMode])

  return {
    isFixtureMode,
  }
}
