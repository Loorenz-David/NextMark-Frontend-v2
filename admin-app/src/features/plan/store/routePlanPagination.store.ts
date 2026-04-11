import { create } from 'zustand'

type RoutePlanPaginationState = {
  queryKey: string | null
  currentPage: number
  nextCursor: string | null
  hasMore: boolean
  isLoadingPage: boolean
  cursorHistory: string[]
  requestVersion: number
  reset: (queryKey: string) => void
  startRequest: () => number
  setLoadingPage: (loading: boolean) => void
  applyPageResult: (payload: {
    queryKey: string
    nextCursor: string | null
    hasMore: boolean
    append: boolean
  }) => void
}

const MAX_CURSOR_HISTORY = 10

export const useRoutePlanPaginationStore = create<RoutePlanPaginationState>((set, get) => ({
  queryKey: null,
  currentPage: 1,
  nextCursor: null,
  hasMore: false,
  isLoadingPage: false,
  cursorHistory: [],
  requestVersion: 0,
  reset: (queryKey) => set(() => ({
    queryKey,
    currentPage: 1,
    nextCursor: null,
    hasMore: false,
    isLoadingPage: false,
    cursorHistory: [],
  })),
  startRequest: () => {
    const nextVersion = get().requestVersion + 1
    set(() => ({ requestVersion: nextVersion, isLoadingPage: true }))
    return nextVersion
  },
  setLoadingPage: (loading) => set(() => ({ isLoadingPage: loading })),
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
      }
    }),
}))

export const selectRoutePlanCurrentPage = (state: RoutePlanPaginationState) => state.currentPage
export const selectRoutePlanHasMore = (state: RoutePlanPaginationState) => state.hasMore
export const selectRoutePlanIsLoadingPage = (state: RoutePlanPaginationState) => state.isLoadingPage
export const selectRoutePlanNextCursor = (state: RoutePlanPaginationState) => state.nextCursor
