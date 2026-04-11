import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { isTemplateChannel } from '../domain/templateChannel.map'
import { isTemplateEvent } from '../domain/templateEvent.map'
import { usePrintTemplateActions } from '../pages/printTemplate.actions'
import { selectTemplateByEventAndChannel } from '../store'
import { usePrintTemplateForm } from '../setters/printTemplate.setters'
import type { availableOrientations } from '../types'
import { usePrintTemplatePageFlow } from './printTemplatePage.flow'
import { usePrintTemplateVariantsFlow } from './printTemplateVariant.flow'

const orientationOptions: Array<{ label: string; value: availableOrientations }> = [
  { label: 'vertical', value: 'vertical' },
  { label: 'horizontal', value: 'horizontal' },
]

export const usePrintTemplateConfigPageFlow = () => {
  const { templates } = usePrintTemplatePageFlow()
  const printTemplateActions = usePrintTemplateActions()
  const printTemplateForm = usePrintTemplateForm()
  const { resetForm, setFormState, buildInitialTemplateForm } = printTemplateForm
  const params = useParams()

  const parsedParams = useMemo(() => {
    const channel = params.channel
    const event = params.event
    if (!channel || !event) return null
    if (!isTemplateChannel(channel) || !isTemplateEvent(event)) return null
    return { channel, event }
  }, [params.channel, params.event])

  const existingTemplate = useMemo(
    () =>
      parsedParams
        ? selectTemplateByEventAndChannel(parsedParams.event, parsedParams.channel, templates)
        : undefined,
    [parsedParams, templates],
  )

  const isExisting = Boolean(existingTemplate?.id)

  useEffect(() => {
    if (!parsedParams) {
      resetForm()
      return
    }
    setFormState(existingTemplate ?? buildInitialTemplateForm(parsedParams.channel, parsedParams.event))
  }, [existingTemplate, parsedParams, resetForm, setFormState, buildInitialTemplateForm])

  const formState = printTemplateForm.formState
  if (!parsedParams || !formState) {
    return { viewModel: null } as const
  } 

  const variantFlow = usePrintTemplateVariantsFlow(parsedParams.channel, formState.selected_variant) 

  return {
    viewModel: {
      parsedParams,
      existingTemplate,
      isExisting,
      formState,
      printTemplateForm,
      printTemplateActions,
      selectedVariantDefinition:variantFlow.selectedVariantDefinition,
      selectedVariant:variantFlow.selectedVariant,
      variantOptions:variantFlow.variantOptions,
      orientationOptions,
    },
  }
}
