import { useCallback, useMemo } from 'react'

import { arrayMove } from '@dnd-kit/sortable'

import { useMessageHandler } from '@shared-message-handler'

import { useUpdateItemStateIndex } from '../api/itemStateApi'
import { useItemStateFlow } from './useItemStateFlow'
import { useItemStates } from './useItemSelectors'
import { useItemConfigActions } from './useItemConfigActions'
import { upsertItemState } from '../store/itemStateStore'
import type { ItemState } from '../types/itemState'

export const useItemStateController = () => {
  useItemStateFlow()
  const items = useItemStates()
  const actions = useItemConfigActions()
  const updateItemStateIndex = useUpdateItemStateIndex()
  const { showMessage } = useMessageHandler()

  const orderStates = useCallback((states: ItemState[]) => {
    const initial = states.find((state) => state.entry_point === 'initial')
    const completed = states.find((state) => state.entry_point === 'completed')
    const fail = states.find((state) => state.entry_point === 'fail')

    const userStates = states
      .filter((state) => !state.is_system)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))

    const ordered: ItemState[] = [
      ...(initial ? [initial] : []),
      ...userStates,
      ...(completed ? [completed] : []),
      ...(fail ? [fail] : []),
    ]

    return { ordered, userStates }
  }, [])

  const orderedAll = useMemo(() => orderStates(items), [items, orderStates])

  const handleReorder = useCallback(
    async (activeId: string, overId: string) => {
      if (activeId === overId) {
        return
      }

      const { userStates } = orderedAll
      const ids = userStates.map((state) => String(state.id ?? state.client_id))
      const oldIndex = ids.indexOf(activeId)
      const newIndex = ids.indexOf(overId)

      if (oldIndex < 0 || newIndex < 0) {
        return
      }

      const previousIndexById = new Map(
        userStates.map((state) => [String(state.id ?? state.client_id), state.index]),
      )

      const nextStates = arrayMove(userStates, oldIndex, newIndex).map((state, index) => ({
        ...state,
        index: index + 1,
      }))

      nextStates.forEach((state) => upsertItemState(state))

      const updates = nextStates.filter((state) => {
        const previousIndex = previousIndexById.get(String(state.id ?? state.client_id))
        return state.id && state.index !== previousIndex
      })

      try {
        await Promise.all(
          updates.map((state) => updateItemStateIndex(state.id as number, state.index as number)),
        )
      } catch (error) {
        console.error('Failed to reorder item states', error)
        showMessage({ status: 500, message: 'Unable to reorder item states.' })
      }
    },
    [orderedAll, showMessage, updateItemStateIndex],
  )

  return {
    items: orderedAll.ordered,
    userStates: orderedAll.userStates,
    openCreate: () => actions.openStateForm('create'),
    openEdit: (clientId: string) => actions.openStateForm('edit', clientId),
    handleReorder,
  }
}
