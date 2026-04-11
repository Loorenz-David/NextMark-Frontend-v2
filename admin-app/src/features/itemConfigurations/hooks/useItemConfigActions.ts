import { useCallback } from 'react'

import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

export const useItemConfigActions = () => {
  const popupManager = usePopupManager()

  const openTypeForm = useCallback(
    (mode: 'create' | 'edit', clientId?: string) =>
      popupManager.open({ key: 'item.type.form', payload: { mode, clientId } }),
    [popupManager],
  )

  const closeTypeForm = useCallback(
    () => popupManager.closeByKey('item.type.form'),
    [popupManager],
  )

  const openPropertyForm = useCallback(
    (mode: 'create' | 'edit', clientId?: string) =>
      popupManager.open({ key: 'item.property.form', payload: { mode, clientId } }),
    [popupManager],
  )

  const closePropertyForm = useCallback(
    () => popupManager.closeByKey('item.property.form'),
    [popupManager],
  )

  const openPositionForm = useCallback(
    (mode: 'create' | 'edit', clientId?: string) =>
      popupManager.open({ key: 'item.position.form', payload: { mode, clientId } }),
    [popupManager],
  )

  const closePositionForm = useCallback(
    () => popupManager.closeByKey('item.position.form'),
    [popupManager],
  )

  const openStateForm = useCallback(
    (mode: 'create' | 'edit', clientId?: string) =>
      popupManager.open({ key: 'item.state.form', payload: { mode, clientId } }),
    [popupManager],
  )

  const closeStateForm = useCallback(
    () => popupManager.closeByKey('item.state.form'),
    [popupManager],
  )

  return {
    openTypeForm,
    closeTypeForm,
    openPropertyForm,
    closePropertyForm,
    openPositionForm,
    closePositionForm,
    openStateForm,
    closeStateForm,
  }
}
