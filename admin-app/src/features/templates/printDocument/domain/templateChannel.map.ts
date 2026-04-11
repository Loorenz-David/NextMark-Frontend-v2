import type { availableChannels } from '../types'

export const templateChannelMap: Record<availableChannels, { label: string }> = {
  item: { label: 'Items' },
  order: { label: 'Orders' },
  route: { label: 'Routes' },
}

export const templateChannels = Object.keys(templateChannelMap) as availableChannels[]

export const isTemplateChannel = (value: string): value is availableChannels =>
  value in templateChannelMap
