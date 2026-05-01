

import type { ComponentType } from 'react'
import type { availableChannels, availableOrientations, availableVariants } from '../types'
import ClassicTemplateItem from '../components/templates/item/classicTemplateItem';
import SevenByTenTemplateItem from '../components/templates/item/sevenByTenTemplateItem';
import ClassicTemplateRoute from '../components/templates/route/classicTemplateRoute';

export type TemplateVariantDefinition = {
  label: string
  previewTitle: string
  previewBody: string
  orientation: availableOrientations
  widthCm: number
  heightCm: number
  component: ComponentType<{ orientation: availableOrientations }>
}

export type TemplateVariantMap =
  Partial<Record<availableVariants, TemplateVariantDefinition>>


const itemTemplateVariantsMap: TemplateVariantMap = {
  classic: {
    label: 'Classic',
    previewTitle: 'Classic Variant',
    orientation:'vertical',
    previewBody: 'Balanced spacing and typography for standard print labels.',
    widthCm: 5,
    heightCm: 7,
    component: ClassicTemplateItem
  },
  '7cm - 10cm': {
    label: '10cm - 7cm',
    previewTitle: '10cm - 7cm Variant',
    orientation:'horizontal',
    previewBody: 'Compact density optimized for high-volume label sheets.',
    widthCm: 10,
    heightCm: 7,
    component: SevenByTenTemplateItem
  },
}
const temporaryTemplate = () => null

const orderTemplateVariantsMap: TemplateVariantMap= {
  classic: {
    label: 'Classic',
    previewTitle: 'Classic Variant',
    orientation:'horizontal',
    previewBody: 'Balanced spacing and typography for standard print labels.',
    widthCm: 5,
    heightCm: 7,
    component: temporaryTemplate,
  },
}

const routeTemplateVariantsMap: TemplateVariantMap = {
  classic: {
    label: 'Classic A4',
    previewTitle: 'Classic Variant A4',
    orientation:'vertical',
    previewBody: 'Balanced spacing and typography for standard print labels.',
    widthCm: 21,
    heightCm: 29.7,
    component: ClassicTemplateRoute,
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
