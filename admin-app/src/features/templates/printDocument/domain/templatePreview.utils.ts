import type { availableOrientations } from '../types'
import type { TemplateVariantDefinition } from './templateVariants.map'

export const buildTemplatePreviewModel = (
  variantDefinition: TemplateVariantDefinition,
  orientation: availableOrientations,
) => {
  const widthCm = variantDefinition.widthCm
  const heightCm = variantDefinition.heightCm

  const previewWidthCm = orientation === 'horizontal' ? heightCm : widthCm
  const previewHeightCm = orientation === 'horizontal' ? widthCm : heightCm

  return {
    widthCm,
    heightCm,
    previewWidthCm,
    previewHeightCm,
    widthLabel: `${previewWidthCm} cm`,
    heightLabel: `${previewHeightCm} cm`,
  }
}
