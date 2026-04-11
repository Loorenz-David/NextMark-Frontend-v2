import { createContext, useContext } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { InviteMemberFormState } from './InviteMember.types'
import type { InviteMemberWarnings } from './InviteMember.warnings'

type InviteMemberContextValue = {
  formState: InviteMemberFormState
  setFormState: Dispatch<SetStateAction<InviteMemberFormState>>
  initialFormRef: RefObject<InviteMemberFormState | null>
  warnings: InviteMemberWarnings
  handleSave: () => void
}

const InviteMemberContext = createContext<InviteMemberContextValue | null>(null)

export const InviteMemberContextProvider = InviteMemberContext.Provider

export const useInviteMember = () => {
  const context = useContext(InviteMemberContext)
  if (!context) {
    throw new Error('useInviteMember must be used within InviteMemberProvider.')
  }
  return context
}
