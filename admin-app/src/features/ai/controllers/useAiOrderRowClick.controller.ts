import { useCallback } from 'react'
import type { Order } from '@shared-domain'

import { useOptionalSectionManager } from '@/shared/resource-manager/useResourceManager'
import { resolveAiOrderDetailPayload } from '../domain/resolveAiOrderDetailPayload'

interface OrderDetailsEntryPayload {
  clientId?: string
  serverId?: number
}

export function useAiOrderRowClick() {
  const sectionManager = useOptionalSectionManager()

  return useCallback((order: Order) => {
    if (!sectionManager) return

    const payload = resolveAiOrderDetailPayload(order)
    if (!payload) {
      return
    }

    const currentPayload = sectionManager.getEntryPayload('order.details') as OrderDetailsEntryPayload | undefined

    if (payload.clientId && currentPayload?.clientId === payload.clientId) {
      return
    }

    if (!payload.clientId && payload.serverId !== undefined && currentPayload?.serverId === payload.serverId) {
      return
    }

    sectionManager.open({
      key: 'order.details',
      payload,
      parentParams: {
        pageClass: 'bg-[var(--color-muted)]/10 ',
        borderLeft: 'rgb(var(--color-light-blue-r),0.7)',
      },
    })
  }, [sectionManager])
}
