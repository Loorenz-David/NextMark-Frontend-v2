import type { availableChannels, availableOrientations, availableVariants } from '../types'
import type { PdfDrawFn } from '../controllers/renderPdfDocument.controller'
import { drawClassicTemplateItem, classicTemplateItemSampleData } from '../components/templates/item/classicTemplateItem.pdf'
import { drawSevenByTenTemplateItem, sevenByTenTemplateItemSampleData } from '../components/templates/item/sevenByTenTemplateItem.pdf'
import { drawClassicTemplateRoute, classicTemplateRouteSampleData } from '../components/templates/route/classicTemplateRoute.pdf'

const noopDraw: PdfDrawFn = () => undefined

export type TemplateVariantDefinition = {
  label: string
  previewTitle: string
  previewBody: string
  orientation: availableOrientations
  widthCm: number
  heightCm: number
  drawFn: PdfDrawFn
  previewData: unknown
}

export type TemplateVariantMap =
  Partial<Record<availableVariants, TemplateVariantDefinition>>

const itemTemplateVariantsMap: TemplateVariantMap = {
  classic: {
    label: 'Classic',
    previewTitle: 'Classic Variant',
    orientation: 'vertical',
    previewBody: 'Balanced spacing and typography for standard print labels.',
    widthCm: 5,
    heightCm: 7,
    drawFn: drawClassicTemplateItem,
    previewData: classicTemplateItemSampleData,
  },
  '7cm - 10cm': {
    label: '10cm - 7cm',
    previewTitle: '10cm - 7cm Variant',
    orientation: 'horizontal',
    previewBody: 'Compact density optimized for high-volume label sheets.',
    widthCm: 10,
    heightCm: 7,
    drawFn: drawSevenByTenTemplateItem,
    previewData: sevenByTenTemplateItemSampleData,
  },
}

const orderTemplateVariantsMap: TemplateVariantMap = {
  classic: {
    label: 'Classic',
    previewTitle: 'Classic Variant',
    orientation: 'horizontal',
    previewBody: 'Balanced spacing and typography for standard print labels.',
    widthCm: 5,
    heightCm: 7,
    drawFn: noopDraw,
    previewData: null,
  },
}

const routeTemplateVariantsMap: TemplateVariantMap = {
  classic: {
    label: 'Classic A4',
    previewTitle: 'Classic Variant A4',
    orientation: 'vertical',
    previewBody: 'Balanced spacing and typography for standard print labels.',
    widthCm: 21,
    heightCm: 29.7,
    drawFn: drawClassicTemplateRoute,
    previewData: classicTemplateRouteSampleData,
  },
}

type ChannelVariantMap = {
  item: TemplateVariantMap
  order: TemplateVariantMap
  route: TemplateVariantMap
}

export const templateVariantsByChannelMap: ChannelVariantMap = {
  item: itemTemplateVariantsMap,
  order: orderTemplateVariantsMap,
  route: routeTemplateVariantsMap,
}

export const getTemplateVariantsMapByChannel = (channel: availableChannels): ChannelVariantMap[availableChannels] =>
  templateVariantsByChannelMap[channel]

export const getTemplateVariantsByChannel = (channel: availableChannels): availableVariants[] =>
  Object.keys(getTemplateVariantsMapByChannel(channel)) as availableVariants[]
