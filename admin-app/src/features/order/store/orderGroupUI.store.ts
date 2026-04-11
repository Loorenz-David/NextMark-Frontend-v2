import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

type OrderGroupUIState = {
  expandedGroupsByKey: Record<string, boolean>
  toggleGroup: (groupKey: string) => void
  setGroupExpanded: (groupKey: string, expanded: boolean) => void
  clearGroupUI: () => void
}

export const useOrderGroupUIStore = create<OrderGroupUIState>((set) => ({
  expandedGroupsByKey: {},
  toggleGroup: (groupKey) =>
    set((state) => ({
      expandedGroupsByKey: {
        ...state.expandedGroupsByKey,
        [groupKey]: !state.expandedGroupsByKey[groupKey],
      },
    })),
  setGroupExpanded: (groupKey, expanded) =>
    set((state) => {
      if (state.expandedGroupsByKey[groupKey] === expanded) {
        return state
      }
      return {
        expandedGroupsByKey: {
          ...state.expandedGroupsByKey,
          [groupKey]: expanded,
        },
      }
    }),
  clearGroupUI: () => set({ expandedGroupsByKey: {} }),
}))

export const useGroupExpanded = (groupKey: string) =>
  useOrderGroupUIStore((state) => state.expandedGroupsByKey[groupKey] ?? false)

export const useOrderGroupUIActions = () =>
  useOrderGroupUIStore(
    useShallow((state) => ({
      toggleGroup: state.toggleGroup,
      setGroupExpanded: state.setGroupExpanded,
      clearGroupUI: state.clearGroupUI,
    })),
  )
