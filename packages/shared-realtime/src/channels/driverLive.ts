import {
  REALTIME_CHANNELS,
  REALTIME_CLIENT_EVENTS,
  REALTIME_SERVER_EVENTS,
  type DriverLocationSnapshotPayload,
  type DriverLocationUpdatedPayload,
} from '../contracts'
import type { SharedRealtimeClient } from '../core/client'

export const createDriverLiveChannel = (client: SharedRealtimeClient) => ({
  subscribeTeamDriverLive: (handlers: {
    onUpdated?: (payload: DriverLocationUpdatedPayload) => void
    onSnapshot?: (payload: DriverLocationSnapshotPayload) => void
  }) => {
    const releaseChannel = client.subscribe(REALTIME_CHANNELS.teamDriverLive, {})
    const releaseUpdated = client.on<DriverLocationUpdatedPayload>(REALTIME_SERVER_EVENTS.driverLocationUpdated, (payload) => {
      handlers.onUpdated?.(payload)
    })
    const releaseSnapshot = client.on<DriverLocationSnapshotPayload>(REALTIME_SERVER_EVENTS.driverLocationSnapshot, (payload) => {
      handlers.onSnapshot?.(payload)
    })

    return () => {
      releaseUpdated()
      releaseSnapshot()
      releaseChannel()
    }
  },
  publishDriverLocation: (payload: {
    coords: DriverLocationUpdatedPayload['coords']
    timestamp: string
  }) => {
    client.publish(REALTIME_CLIENT_EVENTS.driverLocationPublish, payload)
  },
})
