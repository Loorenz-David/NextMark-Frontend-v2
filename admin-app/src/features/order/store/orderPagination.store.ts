import { create } from 'zustand'

type OrderPaginationState = {
  queryKey: string | null
  currentPage: number
  nextCursor: string | null
  hasMore: boolean
  isLoadingPage: boolean
  loadingMode: 'firstPage' | 'nextPage' | null
  cursorHistory: string[]
  requestVersion: number
  reset: (queryKey: string) => void
  startRequest: (mode: 'firstPage' | 'nextPage') => number
  setLoadingPage: (loading: boolean) => void
  applyPageResult: (payload: {
    queryKey: string
    nextCursor: string | null
    hasMore: boolean
    append: boolean
  }) => void
  setHasMore: (hasMore: boolean) => void
}

const MAX_CURSOR_HISTORY = 10

export const useOrderPaginationStore = create<OrderPaginationState>((set, get) => ({
  queryKey: null,
  currentPage: 1,
  nextCursor: null,
  hasMore: false,
  isLoadingPage: false,
  loadingMode: null,
  cursorHistory: [],
  requestVersion: 0,
  reset: (queryKey) => set(() => ({
    queryKey,
    currentPage: 1,
    nextCursor: null,
    hasMore: false,
    isLoadingPage: false,
    loadingMode: null,
    cursorHistory: [],
  })),
  startRequest: (mode) => {
    const nextVersion = get().requestVersion + 1
    set(() => ({
      requestVersion: nextVersion,
      isLoadingPage: true,
      loadingMode: mode,
    }))
    return nextVersion
  },
  setLoadingPage: (loading) =>
    set(() => ({
      isLoadingPage: loading,
      loadingMode: loading ? get().loadingMode : null,
    })),
  applyPageResult: ({ queryKey, nextCursor, hasMore, append }) =>
    set((state) => {
      const nextHistory = append && state.nextCursor
        ? [...state.cursorHistory, state.nextCursor].slice(-MAX_CURSOR_HISTORY)
        : []

      return {
        queryKey,
        nextCursor,
        hasMore,
        currentPage: append ? state.currentPage + 1 : 1,
        cursorHistory: nextHistory,
        isLoadingPage: false,
        loadingMode: null,
      }
    }),
  setHasMore: (hasMore) => set(() => ({ hasMore })),
}))

export const selectOrderCurrentPage = (state: OrderPaginationState) => state.currentPage
export const selectOrderHasMore = (state: OrderPaginationState) => state.hasMore
export const selectOrderIsLoadingPage = (state: OrderPaginationState) => state.isLoadingPage
export const selectOrderLoadingMode = (state: OrderPaginationState) => state.loadingMode
export const selectOrderNextCursor = (state: OrderPaginationState) => state.nextCursor
