import { createEntityStore } from '@shared-store'
import type { OrderCase } from '../domain'

export const useOrderCasesStore = createEntityStore<OrderCase>()
