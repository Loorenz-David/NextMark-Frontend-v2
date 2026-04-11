import type { ReactNode } from 'react'

import { MemberSelectorContext } from './MemberSelector.context'
import { useMemberSelectorControllers } from './MemberSelector.controllers'
import type { MemberSelectorProps } from './MemberSelector.types'

type MemberSelectorProviderProps = MemberSelectorProps & {
  children: ReactNode
}

export const MemberSelectorProvider = ({
  children,
  selectedMember,
  onSelectMember,
}: MemberSelectorProviderProps) => {
  const controllers = useMemberSelectorControllers({
    selectedMemberId: selectedMember,
    onSelectMember,
  })

  const value = {
    ...controllers,
    selectedMemberId: selectedMember,
  }

  return (
    <MemberSelectorContext.Provider value={value}>
      {children}
    </MemberSelectorContext.Provider>
  )
}
