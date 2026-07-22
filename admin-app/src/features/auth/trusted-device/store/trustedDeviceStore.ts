import type { EntityTable } from '@shared-store'
import { createEntityStore, selectAll, selectByClientId } from '@shared-store'

import type { TrustedDevice, TrustedDeviceMap } from '../types/trustedDevice'

export const useTrustedDeviceStore = createEntityStore<TrustedDevice>()

export const selectAllTrustedDevices = (state: EntityTable<TrustedDevice>) =>
  selectAll<TrustedDevice>()(state)

export const selectTrustedDeviceByClientId =
  (clientId: string | null | undefined) => (state: EntityTable<TrustedDevice>) =>
    selectByClientId<TrustedDevice>(clientId)(state)

export const insertTrustedDevices = (table: TrustedDeviceMap) =>
  useTrustedDeviceStore.getState().insertMany(table)

export const upsertTrustedDevice = (item: TrustedDevice) => {
  const state = useTrustedDeviceStore.getState()
  if (state.byClientId[item.client_id]) {
    state.update(item.client_id, (existing) => ({ ...existing, ...item }))
    return
  }
  state.insert(item)
}

export const removeTrustedDevice = (clientId: string) =>
  useTrustedDeviceStore.getState().remove(clientId)

export const clearTrustedDevices = () => useTrustedDeviceStore.getState().clear()
