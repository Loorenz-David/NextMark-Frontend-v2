import { useCallback } from 'react'

import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

import type { MediaPlacement } from '../domain/mediaPlacement'

export const useClientFormConfigActions = () => {
  const popupManager = usePopupManager()

  const openRuleForm = useCallback(
    (mode: 'create' | 'edit', clientId?: string) =>
      popupManager.open({ key: 'clientFormConfig.rule.form', payload: { mode, clientId } }),
    [popupManager],
  )

  const closeRuleForm = useCallback(
    () => popupManager.closeByKey('clientFormConfig.rule.form'),
    [popupManager],
  )

  const openMediaForm = useCallback(
    (mode: 'create' | 'edit', clientId?: string, placement?: MediaPlacement) =>
      popupManager.open({
        key: 'clientFormConfig.media.form',
        payload: { mode, clientId, placement },
      }),
    [popupManager],
  )

  const closeMediaForm = useCallback(
    () => popupManager.closeByKey('clientFormConfig.media.form'),
    [popupManager],
  )

  return { openRuleForm, closeRuleForm, openMediaForm, closeMediaForm }
}
