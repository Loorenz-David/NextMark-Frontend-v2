import type { availableOrientations } from '../types'
import type { TemplateVariantDefinition } from './templateVariants.map'

export const buildTemplatePreviewModel = (
  variantDefinition: TemplateVariantDefinition,
  orientation: availableOrientations,
) => {
  const widthCm = variantDefinition.widthCm
  const heightCm = variantDefinition.heightCm
  const shouldRotateTemplate = orientation === 'horizontal' && widthCm < heightCm

  const previewWidthCm = shouldRotateTemplate ? heightCm : widthCm
  const previewHeightCm = shouldRotateTemplate ? widthCm : heightCm

  return {
    widthCm,
    heightCm,
    previewWidthCm,
    previewHeightCm,
    shouldRotateTemplate,
    widthLabel: `${previewWidthCm} cm`,
    heightLabel: `${previewHeightCm} cm`,
  }
}
