import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'

import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'

import { FacilityContext } from './FacilityContext'

export const FacilityProvider = ({ children }: PropsWithChildren) => {
  const sectionManager = useSectionManager()
  const popupManager = usePopupManager()

  const value = useMemo(
    () => ({ sectionManager, popupManager }),
    [popupManager, sectionManager],
  )

  return <FacilityContext.Provider value={value}>{children}</FacilityContext.Provider>
}
