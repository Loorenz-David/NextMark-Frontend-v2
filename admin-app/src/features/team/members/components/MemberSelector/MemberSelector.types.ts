import type { RefObject } from 'react'
import type { ChangeEvent } from 'react'

import type { TeamMember } from '../../types/teamMember'

export type MemberSelectorProps = {
  selectedMember: number | null | undefined
  onSelectMember: (memberId: number | null ) => void
}

export type MemberSelectorContextValue = {
  isOpen: boolean
  inputValue: string
  members: TeamMember[]
  selectedMember: TeamMember | null 
  selectedMemberId: number | null | undefined
  inputRef: RefObject<HTMLInputElement | null>
  handleOpenChange: (isOpen: boolean) => void
  handleInputFocus: () => void
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleSelectMember: (member: TeamMember) => void

}
