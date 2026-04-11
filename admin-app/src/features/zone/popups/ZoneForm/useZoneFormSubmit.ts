import { useCallback, useState } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { createZoneAction } from '@/features/zone/actions/createZone.action'
import { deleteZoneAction } from '@/features/zone/actions/deleteZone.action'
import { updateZoneAction } from '@/features/zone/actions/updateZone.action'
import { normalizeZoneHexColor } from '@/features/zone/domain/zoneColor.domain'
import type { ZoneFormState } from '@/features/zone/domain/zoneForm.domain'
import {
  buildZoneTemplatePayload,
  validateZoneTemplatePayload,
} from '@/features/zone/domain/zoneTemplateForm.domain'
import type { ZoneDefinition, ZoneState } from '@/features/zone/types'
import { DRAWING_SELECTION_CLEAR_EVENT } from '@/shared/map/domain/constants/drawingSelectionModes'

import type { ZoneFormPayload } from './ZoneForm.types'

export const useZoneFormSubmit = ({
  payload,
  zone,
  upsertZone,
  removeZoneOptimistic,
  removeZoneById,
  setDrawnGeometry,
  onClose,
}: {
  payload: ZoneFormPayload
  zone: (ZoneState & { id: number }) | null
  upsertZone: (zone: ZoneDefinition) => void
  removeZoneOptimistic: (versionId: number, zoneId: number) => void
  removeZoneById: (versionId: number, zoneId: number) => void
  setDrawnGeometry: (geometry: null) => void
  onClose: () => void
}) => {
  const { showMessage } = useMessageHandler()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = useCallback(
    async (formState: ZoneFormState) => {
      const name = formState.name.trim()
      const zoneColor = normalizeZoneHexColor(formState.zone_color) ?? '#111111'
      if (!name) {
        showMessage({ status: 400, message: 'Zone name is required.' })
        return
      }

      setIsSubmitting(true)
      try {
        const templatePayload = buildZoneTemplatePayload({
          ...formState,
          template_name: name,
        })
        const validation = validateZoneTemplatePayload(templatePayload)
        if (!validation.valid) {
          showMessage({ status: 400, message: validation.issues[0] })
          return
        }

        if (payload.mode === 'create') {
          const createdZone = await createZoneAction(
            {
              versionId: payload.versionId,
              name,
              zoneColor,
              geometry: payload.geometry,
              templatePayload,
            },
            {
              upsertZone,
              removeZoneOptimistic,
              showMessage,
            },
          )

          if (createdZone) {
            setDrawnGeometry(null)

            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent(DRAWING_SELECTION_CLEAR_EVENT))
            }

            onClose()
          }

          return
        }

        if (!zone) {
          showMessage({ status: 404, message: 'Zone not found for editing.' })
          return
        }

        const succeeded = await updateZoneAction(
          {
            versionId: payload.versionId,
            zone,
            name,
            zoneColor,
            templatePayload,
          },
          {
            upsertZone,
            showMessage,
          },
        )

        if (succeeded) {
          onClose()
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      onClose,
      payload,
      removeZoneOptimistic,
      setDrawnGeometry,
      showMessage,
      upsertZone,
      zone,
    ],
  )

  const handleDelete = useCallback(async () => {
    if (payload.mode !== 'edit' || !zone) {
      showMessage({ status: 404, message: 'Zone not found for deletion.' })
      return
    }

    setIsDeleting(true)
    try {
      const succeeded = await deleteZoneAction(
        {
          versionId: payload.versionId,
          zone,
        },
        {
          upsertZone,
          removeZoneById,
          showMessage,
        },
      )

      if (succeeded) {
        onClose()
      }
    } finally {
      setIsDeleting(false)
    }
  }, [onClose, payload, removeZoneById, showMessage, upsertZone, zone])

  return {
    isSubmitting,
    isDeleting,
    handleSave,
    handleDelete: payload.mode === 'edit' ? handleDelete : undefined,
  }
}
