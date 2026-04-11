import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { usePrintTemplateControllers } from '../controllers/printTemplate.controllers'
import { selectTemplateByEventAndChannel } from '../store'
import type { PrintTemplate } from '../types'


type SaveTemplateOptions = {
  isExisting: boolean
  existingTemplate?: PrintTemplate
}

export const usePrintTemplateActions = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { createTemplateController, updateTemplateController } = usePrintTemplateControllers()


  const closeTemplatePage = useCallback(() => {
    const channel = params.channel
    if (!channel) {
      navigate('/settings/print-templates')
      return
    }
    navigate(`/settings/print-templates/${channel}`)
  }, [navigate, params.channel])

  const createTemplate = useCallback(async (template: PrintTemplate) => {
    return createTemplateController(template)
  }, [createTemplateController])

  const updateTemplate = useCallback(async (template: PrintTemplate, base: PrintTemplate) => {
    return updateTemplateController(base, template)
  }, [updateTemplateController])

  const saveChangedTemplate = useCallback(
    async (template: PrintTemplate, options: SaveTemplateOptions) => {

      const didSave = options?.isExisting
        ? await updateTemplate(template, options.existingTemplate ?? template)
        : await createTemplate(template)

      if (didSave) {
        closeTemplatePage()
      }
      return didSave
    },
    [closeTemplatePage, createTemplate, updateTemplate],
  )

  return {
    createTemplate,
    updateTemplate,
    closeTemplatePage,
    saveChangedTemplate,
    selectTemplateByEventAndChannel,
  }
}
