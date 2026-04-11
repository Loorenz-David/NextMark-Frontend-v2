import { useMemo } from 'react'

import { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'
import type { StackActionManager } from '@/shared/stack-manager/StackActionManager'
import type { BaseControls } from '@/shared/resource-manager/types'
import type { PayloadBase } from '../types/types'

type HomeBaseControls = BaseControls<PayloadBase>

export const useHomeDesktopDerivedStateFlow = ({
  sectionManager,
  baseControlls,
}: {
  sectionManager: StackActionManager<Record<string, unknown>>
  baseControlls: HomeBaseControls
}) => {
  const sectionEntries = useStackActionEntries(sectionManager)

  return useMemo(() => {
    const openSectionsCount = sectionEntries.filter((entry) => !entry.isClosing).length
    const isRouteOperationsOverlayActive = baseControlls.isBaseOpen

    return {
      openSectionsCount,
      isRouteOperationsOverlayActive,
    }
  }, [baseControlls.isBaseOpen, sectionEntries])
}
