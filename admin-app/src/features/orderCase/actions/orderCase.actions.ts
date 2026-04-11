import { useCallback } from 'react'

import { useSectionManager } from '@/shared/resource-manager/useResourceManager'

export const useOrderCaseActions = () => {
  const sectionManager = useSectionManager()

  const openCaseMain = useCallback(() => {
    if (sectionManager.hasKey('orderCase.main')) {
      return
    }

    sectionManager.open({
      key: 'orderCase.main',
    })
  }, [sectionManager])

  return {
    openCaseMain,
  }
}
