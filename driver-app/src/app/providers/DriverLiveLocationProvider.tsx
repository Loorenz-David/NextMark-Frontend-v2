import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { createDriverLiveChannel } from '@shared-realtime'
import { useSession } from './session.context'
import { useWorkspace } from './workspace.context'
import { useDriverServices } from './driverServices.context'
import { driverRealtimeClient } from '@/app/services/realtime'
import type { Coordinates } from '@/shared/map'

const MIN_PUBLISH_DISTANCE_METERS = 15
const MAX_PUBLISH_INTERVAL_MS = 15000

const isRealtimeEligible = (
  sessionState: string,
  socketToken: string | null | undefined,
  teamId: string | null | undefined,
  canExecuteRoutes: boolean,
) =>
  sessionState === 'authenticated'
  && Boolean(socketToken)
  && Boolean(teamId)
  && canExecuteRoutes

const toRadians = (value: number) => (value * Math.PI) / 180

const calculateDistanceMeters = (left: Coordinates, right: Coordinates) => {
  const earthRadiusMeters = 6371000
  const deltaLat = toRadians(right.lat - left.lat)
  const deltaLng = toRadians(right.lng - left.lng)
  const lat1 = toRadians(left.lat)
  const lat2 = toRadians(right.lat)

  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusMeters * c
}

export function DriverLiveLocationProvider({ children }: PropsWithChildren) {
  const { session, sessionState } = useSession()
  const { workspace } = useWorkspace()
  const { browserLocationService } = useDriverServices()

  const driverLiveChannel = useMemo(
    () => createDriverLiveChannel(driverRealtimeClient),
    [],
  )
  const lastPublishedRef = useRef<{ coords: Coordinates; publishedAt: number } | null>(null)

  useEffect(() => {
    const canExecuteRoutes = workspace?.capabilities.canExecuteRoutes ?? false
    const teamId = workspace?.teamId ?? null
    const socketToken = session?.socketToken

    if (!isRealtimeEligible(sessionState, socketToken, teamId, canExecuteRoutes)) {
      lastPublishedRef.current = null
      return
    }

    const publishIfNeeded = (coords: Coordinates) => {
      const now = Date.now()
      const previous = lastPublishedRef.current

      if (previous) {
        const movedMeters = calculateDistanceMeters(previous.coords, coords)
        const elapsedMs = now - previous.publishedAt
        if (movedMeters < MIN_PUBLISH_DISTANCE_METERS && elapsedMs < MAX_PUBLISH_INTERVAL_MS) {
          return
        }
      }

      driverLiveChannel.publishDriverLocation({
        coords,
        timestamp: new Date(now).toISOString(),
      })
      lastPublishedRef.current = {
        coords,
        publishedAt: now,
      }
    }

    const stopWatching = browserLocationService.watchCoordinates(
      (coords) => {
        publishIfNeeded(coords)
      },
      (error) => {
        console.warn('Driver live location watch failed.', error)
      },
    )

    return () => {
      stopWatching()
    }
  }, [
    browserLocationService,
    driverLiveChannel,
    session?.socketToken,
    sessionState,
    workspace,
  ])

  return <>{children}</>
}
