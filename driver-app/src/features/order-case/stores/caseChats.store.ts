import { createEntityStore } from '@shared-store'
import type { CaseChat } from '../domain'

export const useCaseChatsStore = createEntityStore<CaseChat>()
