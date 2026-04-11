import type { address } from '@/types/address'

export type PlaceSuggestion = {
  type: 'place'
  description: string
  placeId: string
  mainText?: string
  secondaryText?: string
}

export type CurrentLocationSuggestion = {
  type: 'current-location'
  id: 'current-location'
  label: string
}

export type SavedLocation = {
  id: string
  label?: string
  address: address
  usageCount: number
  lastUsedAt: number
}

export type SavedLocationSuggestion = {
  type: 'saved-location'
  id: string
  label?: string
  address: address
}

export type RenderSuggestion = PlaceSuggestion | CurrentLocationSuggestion | SavedLocationSuggestion
