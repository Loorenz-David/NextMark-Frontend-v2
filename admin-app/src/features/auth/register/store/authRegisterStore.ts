import { create } from 'zustand'

export type AuthRegisterState = {
  isLoading: boolean
  error?: string

  setLoading: (loading: boolean) => void
  setError: (error?: string) => void
  reset: () => void
}

export const useAuthRegisterStore = create<AuthRegisterState>((set) => ({
  isLoading: false,
  error: undefined,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({ isLoading: false, error: undefined }),
}))

export const selectAuthRegisterLoading = (state: AuthRegisterState) => state.isLoading
export const selectAuthRegisterError = (state: AuthRegisterState) => state.error
