import type { PrintTemplate } from '../types'
import { templateChannelMap } from './templateChannel.map'
import { templateEventMap } from './templateEvent.map'
import { getTemplateVariantsMapByChannel } from './templateVariants.map'

export const useValidationPrintTemplate = () => {
  const validatePrintTemplate = (printTemplateForm: PrintTemplate) => {
    const variantsMap =
      printTemplateForm.channel in templateChannelMap
        ? getTemplateVariantsMapByChannel(printTemplateForm.channel)
        : null

    const isValid = (
      Boolean(variantsMap && printTemplateForm.selected_variant in variantsMap)
      && printTemplateForm.channel in templateChannelMap
      && printTemplateForm.event in templateEventMap
      && printTemplateForm.orientation
      && typeof printTemplateForm.enable === 'boolean'
      && typeof printTemplateForm.ask_permission === 'boolean'
    )
    return isValid
  }

  

  return {
    validatePrintTemplate,
  }
}
