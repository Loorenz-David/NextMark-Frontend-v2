import { useShallow } from 'zustand/react/shallow'

import {
  selectAllItemTypes,
  selectItemTypeByClientId,
  useItemTypeStore,
} from '../store/itemTypeStore'
import {
  selectAllItemProperties,
  selectItemPropertyByClientId,
  selectItemPropertyByServerId,
  useItemPropertyStore,
} from '../store/itemPropertyStore'
import {
  selectAllItemPositions,
  selectItemPositionByClientId,
  useItemPositionStore,
} from '../store/itemPositionStore'
import {
  selectAllItemStates,
  selectItemStateByClientId,
  selectItemStateByServerId,
  useItemStateStore,
} from '../store/itemStateStore'

export const useItemTypes = () => useItemTypeStore(useShallow(selectAllItemTypes))

export const useItemProperties = () => useItemPropertyStore(useShallow(selectAllItemProperties))

export const useItemPositions = () => useItemPositionStore(useShallow(selectAllItemPositions))

export const useItemStates = () => useItemStateStore(useShallow(selectAllItemStates))

export const useItemTypeByClientId = (clientId: string | null | undefined) =>
  useItemTypeStore(selectItemTypeByClientId(clientId))

export const useItemPropertyByClientId = (clientId: string | null | undefined) =>
  useItemPropertyStore(selectItemPropertyByClientId(clientId))

export const useItemPropertyByServerId = (id: number | null | undefined) =>
  useItemPropertyStore(selectItemPropertyByServerId(id))

export const useItemPositionByClientId = (clientId: string | null | undefined) =>
  useItemPositionStore(selectItemPositionByClientId(clientId))

export const useItemStateByClientId = (clientId: string | null | undefined) =>
  useItemStateStore(selectItemStateByClientId(clientId))

export const useItemStateByServerId = (id: number | null | undefined) =>
  useItemStateStore(selectItemStateByServerId(id))
