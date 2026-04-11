import { createContext, useContext } from 'react'

import type { MemberSelectorContextValue } from './MemberSelector.types'

export const MemberSelectorContext = createContext<MemberSelectorContextValue | null>(null)

export const useMemberSelectorContext = () => {
  const ctx = useContext(MemberSelectorContext)
  if (!ctx) {
    throw new Error('MemberSelector context is missing. Wrap with MemberSelectorProvider.')
  }
  return ctx
}
