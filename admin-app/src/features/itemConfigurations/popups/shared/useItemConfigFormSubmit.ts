import { useCallback } from 'react'
import type { RefObject } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { getObjectDiff } from '@shared-utils'
import { hasFormChanges } from '@shared-domain'
import { buildClientId } from '@/lib/utils/clientId'

export type ItemConfigFormSubmitOptions<
  TPayload extends { client_id: string },
  TFormState extends Record<string, unknown>,
  TEntity extends TPayload & { id?: number },
> = {
  entityPrefix: string
  payload: { mode: 'create' | 'edit'; clientId?: string }
  formState: TFormState
  validateForm: () => boolean
  initialFormRef: RefObject<TFormState | null>
  existing: TEntity | null | undefined
  buildCreatePayload: (formState: TFormState, clientId: string) => TPayload
  createApi: (payload: TPayload) => Promise<{ data?: Record<string, number> }>
  updateApi: (id: number, diff: Partial<TFormState>) => Promise<unknown>
  deleteApi?: (id: number) => Promise<unknown>
  upsertFn: (entity: TEntity) => void
  removeFn: (clientId: string) => void
  closeForm: () => void
  /** Called after a successful create or update with the final entity (ID patched). */
  onSuccess?: (entity: TEntity) => void
  /** Called after a successful delete with the removed entity. */
  onDelete?: (entity: TEntity) => void
}

/**
 * Generic CUD form-submit hook shared across all four item-configuration
 * entity types (Type, Property, Position, State).
 *
 * Strategy:
 *  create  — optimistic insert → API call → patch server ID → rollback on error
 *  update  — optimistic update → API call → rollback on error
 *  delete  — optimistic remove → API call → rollback on error
 */
export const useItemConfigFormSubmit = <
  TPayload extends { client_id: string },
  TFormState extends Record<string, unknown>,
  TEntity extends TPayload & { id?: number },
>(
  options: ItemConfigFormSubmitOptions<TPayload, TFormState, TEntity>,
) => {
  const { showMessage } = useMessageHandler()
  const {
    entityPrefix,
    payload,
    formState,
    validateForm,
    initialFormRef,
    existing,
    buildCreatePayload,
    createApi,
    updateApi,
    deleteApi,
    upsertFn,
    removeFn,
    closeForm,
    onSuccess,
    onDelete,
  } = options

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      showMessage({ status: 400, message: 'Please fix the highlighted fields.' })
      return
    }

    if (!hasFormChanges(formState, initialFormRef)) {
      showMessage({ status: 400, message: 'No changes to save.' })
      return
    }

    const initial = initialFormRef.current
    if (!initial) {
      showMessage({ status: 400, message: 'Missing initial form snapshot.' })
      return
    }

    if (payload.mode === 'create') {
      const clientId = existing?.client_id ?? buildClientId(entityPrefix)
      const createPayload = buildCreatePayload(formState, clientId)
      const optimisticEntity = { ...createPayload } as unknown as TEntity

      // Optimistic insert (no server id yet)
      upsertFn(optimisticEntity)

      try {
        const response = await createApi(createPayload)
        const serverId = response.data?.[clientId]
        const finalEntity = typeof serverId === 'number'
          ? ({ ...createPayload, id: serverId } as unknown as TEntity)
          : optimisticEntity
        if (typeof serverId === 'number') {
          // Patch the store record with the real server id
          upsertFn(finalEntity)
        }
        onSuccess?.(finalEntity)
        closeForm()
      } catch (error) {
        console.error(`Failed to create ${entityPrefix}`, error)
        removeFn(clientId)
        showMessage({ status: 500, message: `Unable to create ${entityPrefix}.` })
      }
    } else if (existing?.id) {
      const diff = getObjectDiff(initial, formState)
      const snapshot = { ...existing }

      // Optimistic update
      upsertFn({ ...existing, ...diff } as unknown as TEntity)

      try {
        await updateApi(existing.id, diff)
        onSuccess?.({ ...existing, ...diff } as unknown as TEntity)
        closeForm()
      } catch (error) {
        console.error(`Failed to update ${entityPrefix}`, error)
        upsertFn(snapshot as unknown as TEntity)
        showMessage({ status: 500, message: `Unable to update ${entityPrefix}.` })
      }
    }
  }, [
    buildCreatePayload,
    closeForm,
    createApi,
    entityPrefix,
    existing,
    formState,
    initialFormRef,
    payload.mode,
    removeFn,
    showMessage,
    updateApi,
    upsertFn,
    validateForm,
    onSuccess,
  ])

  const handleDelete = useCallback(async () => {
    if (!existing?.id || !deleteApi) return

    const snapshot = { ...existing }
    removeFn(existing.client_id)

    try {
      await deleteApi(existing.id)
      onDelete?.(snapshot as unknown as TEntity)
      closeForm()
    } catch (error) {
      console.error(`Failed to delete ${entityPrefix}`, error)
      upsertFn(snapshot as unknown as TEntity)
      showMessage({ status: 500, message: `Unable to delete ${entityPrefix}.` })
    }
  }, [closeForm, deleteApi, entityPrefix, existing, onDelete, removeFn, showMessage, upsertFn])

  return { handleSave, handleDelete }
}
