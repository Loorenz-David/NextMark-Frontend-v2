import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'

import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'

import { ItemContext } from './ItemContext'

export const ItemProvider = ({ children }: PropsWithChildren) => {
  const sectionManager = useSectionManager()
  const popupManager = usePopupManager()

  const value = useMemo(
    () => ({ sectionManager, popupManager }),
    [popupManager, sectionManager],
  )

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>
}
