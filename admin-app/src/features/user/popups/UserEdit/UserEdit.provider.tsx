import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { useCurrentUser } from '../../store/user.store'
import type { User } from '../../types/user'

import { UserEditContextProvider } from './UserEdit.context'
import type { UserEditFormState } from './UserEdit.types'
import { useUserEditWarnings } from './UserEdit.warnings'
import { useUserEditValidation } from './UserEdit.validation'
import { useUserEditSubmit } from './useUserEditSubmit'

const buildInitialForm = (user: User | null): UserEditFormState => ({
  username: user?.username ?? '',
  email: user?.email ?? '',
  phone_number: user?.phone_number ?? null,
  password: '',
  password_confirmation: '',
})

export const UserEditProvider = ({ children }: { children: ReactNode }) => {
  const user = useCurrentUser()
  const [formState, setFormState] = useState<UserEditFormState>(() => buildInitialForm(user))
  const warnings = useUserEditWarnings()
  const initialFormRef = useRef<UserEditFormState | null>(null)
  console.log(formState,'the form datat')
  useEffect(() => {
    const initial = buildInitialForm(user)
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [user])

  const { validateForm } = useUserEditValidation({ formState, warnings })

  const submitters = useUserEditSubmit({
    user,
    formState,
    validateForm,
    initialFormRef,
  })

  const value = useMemo(
    () => ({
      user,
      formState,
      setFormState,
      initialFormRef,
      warnings,
      ...submitters,
    }),
    [formState, initialFormRef, submitters, user, warnings],
  )

  return <UserEditContextProvider value={value}>{children}</UserEditContextProvider>
}
