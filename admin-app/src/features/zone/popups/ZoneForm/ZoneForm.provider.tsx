import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { buildInitialZoneFormState } from '@/features/zone/domain/zoneForm.domain'
import { useEnsureZoneTemplate } from '@/features/zone/controllers/useEnsureZoneTemplate'
import {
  selectZoneByVersionAndId,
  useZoneStore,
} from '@/features/zone/store/zone.store'

import { useZoneFormContextValue } from './ZoneForm.context'
import { useZoneFormSubmit } from './useZoneFormSubmit'
import type { ZoneFormPayload } from './ZoneForm.types'

export const ZoneFormProvider = ({
  children,
  payload,
  onClose,
}: {
  children: ReactNode
  payload: ZoneFormPayload
  onClose: () => void
}) => {
  const upsertZone = useZoneStore((state) => state.upsertZone)
  const removeZoneOptimistic = useZoneStore((state) => state.removeZoneOptimistic)
  const removeZoneById = useZoneStore((state) => state.removeZoneById)
  const setDrawnGeometry = useZoneStore((state) => state.setDrawnGeometry)
  const ZoneFormContext = useZoneFormContextValue()

  const zone = useZoneStore((state) =>
    payload.mode === 'edit'
      ? selectZoneByVersionAndId(state, payload.versionId, payload.zoneId)
      : null,
  )

  const { load: ensureZoneTemplate } = useEnsureZoneTemplate(
    payload.mode === 'edit' ? payload.versionId : null,
    payload.mode === 'edit' ? payload.zoneId : null,
  )

  const initialLoadAttemptKeyRef = useRef<string | null>(null)
  const [formState, setFormState] = useState(() => buildInitialZoneFormState(zone))
  const initialFormRef = useRef(buildInitialZoneFormState(zone))

  useEffect(() => {
    const initial = buildInitialZoneFormState(zone)
    setFormState(initial)
    initialFormRef.current = initial
  }, [zone, payload])

  useEffect(() => {
    if (payload.mode !== 'edit') {
      initialLoadAttemptKeyRef.current = null
      return
    }

    const loadAttemptKey = `${payload.versionId}:${payload.zoneId}`
    if (initialLoadAttemptKeyRef.current === loadAttemptKey) {
      return
    }

    initialLoadAttemptKeyRef.current = loadAttemptKey
    void ensureZoneTemplate()
  }, [ensureZoneTemplate, payload])

  const {
    handleSave: submitForm,
    handleDelete,
    isSubmitting,
    isDeleting,
  } = useZoneFormSubmit({
    payload,
    zone: zone && typeof zone.id === 'number' ? zone : null,
    upsertZone,
    removeZoneOptimistic,
    removeZoneById,
    setDrawnGeometry,
    onClose,
  })

  const handleSave = useMemo(
    () => () => {
      void submitForm(formState)
    },
    [formState, submitForm],
  )

  const value = useMemo(
    () => ({
      payload,
      formState,
      setFormState,
      initialFormRef,
      zone,
      handleCancel: onClose,
      handleSave,
      handleDelete,
      isSubmitting,
      isDeleting,
    }),
    [formState, handleDelete, handleSave, isDeleting, isSubmitting, onClose, payload, zone],
  )

  return <ZoneFormContext.Provider value={value}>{children}</ZoneFormContext.Provider>
}
