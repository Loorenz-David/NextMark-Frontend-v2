import { createEntityStore } from '@shared-store'
import type { DriverOrderRecord } from '../domain'

export const useOrdersStore = createEntityStore<DriverOrderRecord>()
