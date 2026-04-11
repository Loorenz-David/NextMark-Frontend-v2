import {
  selectAuthRegisterError,
  selectAuthRegisterLoading,
  useAuthRegisterStore,
} from '@/features/auth/register/store/authRegisterStore'

export const useRegisterLoading = () => useAuthRegisterStore(selectAuthRegisterLoading)

export const useRegisterError = () => useAuthRegisterStore(selectAuthRegisterError)
