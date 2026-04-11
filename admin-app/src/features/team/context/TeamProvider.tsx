import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'

import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'

import { TeamContext } from './TeamContext'

export const TeamProvider = ({ children }: PropsWithChildren) => {
  const sectionManager = useSectionManager()
  const popupManager = usePopupManager()

  const value = useMemo(
    () => ({ sectionManager, popupManager }),
    [popupManager, sectionManager],
  )

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}
