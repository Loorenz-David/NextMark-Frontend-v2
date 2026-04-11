import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'

import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'

import { VehicleContext } from './VehicleContext'

export const VehicleProvider = ({ children }: PropsWithChildren) => {
  const sectionManager = useSectionManager()
  const popupManager = usePopupManager()

  const value = useMemo(
    () => ({ sectionManager, popupManager }),
    [popupManager, sectionManager],
  )

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>
}
