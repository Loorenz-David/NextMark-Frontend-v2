import { create } from 'zustand'

export type QueryState<
  TFilters extends Record<string, unknown> = Record<string, unknown>,
  TSort = string | null,
  TPagination = Record<string, unknown> | null,
> = {
  search: string
  filters: TFilters
  sort: TSort | null
  pagination: TPagination | null
  setSearch: (search: string) => void
  setFilters: (filters: TFilters) => void
  updateFilters: (partial: Partial<TFilters>) => void
  deleteFilter: (key: keyof TFilters) => void
  setSort: (sort: TSort | null) => void
  setPagination: (pagination: TPagination | null) => void
  reset: () => void
  clear: () => void
}

type QueryStateDefaults<
  TFilters extends Record<string, unknown>,
  TSort,
  TPagination,
> = Pick<QueryState<TFilters, TSort, TPagination>, 'search' | 'filters' | 'sort' | 'pagination'>

export const createQueryStore = <
  TFilters extends Record<string, unknown> = Record<string, unknown>,
  TSort = string | null,
  TPagination = Record<string, unknown> | null,
>(defaults?: Partial<QueryStateDefaults<TFilters, TSort, TPagination>>) =>
  create<QueryState<TFilters, TSort, TPagination>>((set) => {
    const initialDefaults: QueryStateDefaults<TFilters, TSort, TPagination> = {
      search: defaults?.search ?? '',
      filters: (defaults?.filters ?? {}) as TFilters,
      sort: (defaults?.sort ?? null) as TSort | null,
      pagination: (defaults?.pagination ?? null) as TPagination | null,
    }

    return {
      ...initialDefaults,

      setSearch: (search) =>
        set(() => ({ search })),

      setFilters: (filters) =>
        set(() => ({ filters })),

      updateFilters: (partial) =>
        set((state) => ({ filters: { ...state.filters, ...partial } })),

      deleteFilter: (key: keyof TFilters) =>
        set((state) => {
          const { [key]: _removed, ...rest } = state.filters
          return { filters: rest as TFilters }
        }),

      setSort: (sort) =>
        set(() => ({ sort })),

      setPagination: (pagination) =>
        set(() => ({ pagination })),

      reset: () =>
        set(() => ({ ...initialDefaults })),

      clear: () =>
        set(() => ({
          search: '',
          filters: {} as TFilters,
          sort: null,
          pagination: null,
        })),
    }
  })
