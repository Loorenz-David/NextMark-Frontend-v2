import { getTemplateVariantsByChannel, getTemplateVariantsMapByChannel } from "../domain"
import type { availableChannels, availableVariants } from "../types"

export const usePrintTemplateVariantsFlow = (channel: availableChannels, selected_variant: availableVariants)=>{
    
    const templateVariantsMap = getTemplateVariantsMapByChannel(channel)
    const templateVariants = getTemplateVariantsByChannel(channel)

    if (templateVariants.length === 0) {
        throw new Error(`No variants configured for channel "${channel}"`)
    }
    const selectedVariant =
        selected_variant in templateVariantsMap
        ? selected_variant
        : templateVariants[0]
        
    const selectedVariantDefinition = templateVariantsMap[selectedVariant]

    if (!selectedVariantDefinition) {
        throw new Error(
            `Variant definition missing for channel "${channel}" and variant "${selectedVariant}".`
        )
    }

    const variantOptions = templateVariants
        .map((variant) => {
        const definition = templateVariantsMap[variant]
        if (!definition) return null
        return {
            label: definition.label,
            value: variant,
        }
        })
        .filter((entry): entry is { label: string; value: availableVariants } => entry !== null)

    
    return {
        selectedVariant,
        selectedVariantDefinition,
        variantOptions 
    }
}