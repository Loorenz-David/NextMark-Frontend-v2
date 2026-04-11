import { createEntityStore } from '@shared-store'
import type { DriverRouteRecord } from '../domain'

export const useRoutesStore = createEntityStore<DriverRouteRecord>()
