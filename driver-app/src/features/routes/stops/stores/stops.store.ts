import { createEntityStore } from '@shared-store'
import type { DriverRouteStopRecord } from '../domain'

export const useStopsStore = createEntityStore<DriverRouteStopRecord>()
