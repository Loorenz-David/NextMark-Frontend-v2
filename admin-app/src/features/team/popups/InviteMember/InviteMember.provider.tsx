import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { InviteMemberContextProvider } from './InviteMember.context'
import type { InviteMemberFormState } from './InviteMember.types'
import { useInviteMemberWarnings } from './InviteMember.warnings'
import { useInviteMemberValidation } from './InviteMember.validation'
import { useInviteMemberSubmit } from './useInviteMemberSubmit'

const buildInitialForm = (): InviteMemberFormState => ({
  target_username: '',
  target_email: '',
  user_role_name: '',
  user_role_id: '',
})

export const InviteMemberProvider = ({ children }: { children: ReactNode }) => {
  const [formState, setFormState] = useState<InviteMemberFormState>(buildInitialForm)
  const initialFormRef = useRef<InviteMemberFormState | null>(null)
  const warnings = useInviteMemberWarnings()

  useEffect(() => {
    const initial = buildInitialForm()
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [])

  const { validateForm } = useInviteMemberValidation({ formState, warnings })
  const submitters = useInviteMemberSubmit({
    formState,
    validateForm,
    initialFormRef,
  })

  const value = useMemo(
    () => ({
      formState,
      setFormState,
      initialFormRef,
      warnings,
      ...submitters,
    }),
    [formState, submitters, warnings],
  )

  return <InviteMemberContextProvider value={value}>{children}</InviteMemberContextProvider>
}
