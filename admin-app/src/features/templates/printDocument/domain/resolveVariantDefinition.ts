import type { availableChannels, availableVariants } from '../types'
import type { TemplateVariantDefinition } from './templateVariants.map'
import { getTemplateVariantsMapByChannel } from './templateVariants.map'

export const resolveVariantDefinition = (
  channel: availableChannels,
  variant: availableVariants,
): TemplateVariantDefinition | null => {
  const variantMap = getTemplateVariantsMapByChannel(channel)
  return variantMap[variant] ?? null
}
