import { create } from 'zustand'

export type Pagination = {
  has_more: boolean
  next_cursor?: string | number | null
  prev_cursor?: string | number | null
  limit?: number
}

export type ListState<S = unknown, Q = unknown, P = Pagination> = {
  queryKey?: string
  query?: Q
  stats?: S
  pagination?: P
  isLoading: boolean
  error?: string
  setLoading: (loading: boolean) => void
  setResult: (payload: {
    queryKey: string
    query?: Q
    stats?: S
    pagination?: P
  }) => void
  setError: (error?: string) => void
  clear: () => void
}

export const createListStore = <S = unknown, Q = unknown, P = Pagination>() =>
  create<ListState<S, Q, P>>((set) => ({
    queryKey: undefined,
    query: undefined,
    stats: undefined,
    pagination: undefined,
    isLoading: false,
    error: undefined,

    setLoading: (loading) =>
      set(() => ({ isLoading: loading })),

    setResult: ({ queryKey, query, stats, pagination }) =>
      set(() => ({
        queryKey,
        query,
        stats,
        pagination,
        isLoading: false,
        error: undefined,
      })),

    setError: (error) =>
      set(() => ({
        error,
        isLoading: false,
      })),

    clear: () =>
      set(() => ({
        queryKey: undefined,
        query: undefined,
        stats: undefined,
        pagination: undefined,
        isLoading: false,
        error: undefined,
      })),
  }))
