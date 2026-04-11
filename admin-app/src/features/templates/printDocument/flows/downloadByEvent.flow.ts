import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { downloadBlob } from '../controllers/downloadBlob.controller'
import { renderComponentToPdfBlob } from '../controllers/renderComponentToPdfBlob.controller'
import { resolveActiveTemplateByChannelAndEvent } from '../domain/resolveActiveTemplate'
import { resolveVariantDefinition } from '../domain/resolveVariantDefinition'
import type { availableChannels, availableEvents } from '../types'

type DownloadByEventParams = {
  channel: availableChannels
  event: availableEvents
  data: unknown
  fileName: string
}

export const useDownloadTemplateByEventFlow = () => {
  const { showMessage } = useMessageHandler()

  const downloadByEvent = async ({
    channel,
    event,
    data,
    fileName,
  }: DownloadByEventParams): Promise<void> => {
    try {
      const activeTemplate = resolveActiveTemplateByChannelAndEvent(channel, event)
      if (!activeTemplate) {
        return
      }
      
      const variantDefinition = resolveVariantDefinition(channel, activeTemplate.selected_variant)
      if (!variantDefinition) {
        showMessage({ status: 404, message: 'Selected template variant not found.' })
        return
      }

      const blob = await renderComponentToPdfBlob(
        variantDefinition.component,
        data,
        variantDefinition.widthCm,
        variantDefinition.heightCm,
        activeTemplate.orientation,
      )

      downloadBlob(blob, fileName)
    } catch (error) {
      if (error instanceof ApiError) {
        showMessage({ status: error.status, message: error.message })
        return
      }
      showMessage({ status: 500, message: 'Unable to generate print document.' })
    }
  }

  return {
    downloadByEvent,
  }
}
