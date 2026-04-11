import type { Dispatch, SetStateAction, RefObject } from 'react'
import type { Phone } from '@/types/phone'

import type { User } from '../../types/user'
import type { useUserEditWarnings } from './UserEdit.warnings'
import type { useUserEditSubmit } from './useUserEditSubmit'

export type UserEditFormState = {
  username: string
  email: string
  phone_number: Phone | null
  password: string
  password_confirmation: string
}

export type UserEditWarnings = ReturnType<typeof useUserEditWarnings>

export type UserEditSubmitters = ReturnType<typeof useUserEditSubmit>

export type UserEditContextValue = {
  user: User | null
  formState: UserEditFormState
  setFormState: Dispatch<SetStateAction<UserEditFormState>>
  initialFormRef: RefObject<UserEditFormState | null>
  warnings: UserEditWarnings
} & UserEditSubmitters
