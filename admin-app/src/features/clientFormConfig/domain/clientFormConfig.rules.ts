import type { ClientFormMedia } from '../types/clientFormMedia'
import type { ClientFormRule } from '../types/clientFormRule'
import type { ClientFormSettings } from '../types/clientFormSettings'
import type { ClientFormTermsVersion } from '../types/clientFormTerms'
import { MEDIA_PLACEMENTS, type MediaPlacement } from './mediaPlacement'

/**
 * `require_acceptance` only has an effect while the terms section is rendered at
 * all — the backend ignores it otherwise, so the UI must not imply it is live.
 */
export const isRequireAcceptanceMeaningful = (settings: ClientFormSettings): boolean =>
  settings.terms_enabled

/** The customer only ever sees terms when all three conditions hold. */
export const willCustomerSeeTerms = (
  settings: ClientFormSettings,
  activeVersion: ClientFormTermsVersion | null,
): boolean => settings.terms_enabled && activeVersion !== null

export const sortRulesByPosition = (rules: ClientFormRule[]): ClientFormRule[] =>
  [...rules].sort((left, right) => left.position - right.position)

export const groupMediaByPlacement = (
  media: ClientFormMedia[],
): Record<MediaPlacement, ClientFormMedia[]> => {
  const grouped = MEDIA_PLACEMENTS.reduce(
    (accumulator, placement) => {
      accumulator[placement] = []
      return accumulator
    },
    {} as Record<MediaPlacement, ClientFormMedia[]>,
  )

  for (const item of media) {
    grouped[item.placement]?.push(item)
  }

  for (const placement of MEDIA_PLACEMENTS) {
    grouped[placement].sort((left, right) => left.position - right.position)
  }

  return grouped
}

/**
 * Reorder endpoints reject partial lists, so a reorder is only sendable once
 * every row in the scope has a server id.
 */
export const collectReorderIds = (items: Array<{ id?: number | null }>): number[] | null => {
  const ids: number[] = []
  for (const item of items) {
    if (typeof item.id !== 'number') {
      return null
    }
    ids.push(item.id)
  }
  return ids
}

export const filterRules = (rules: ClientFormRule[], query: string): ClientFormRule[] => {
  const term = query.trim().toLowerCase()
  if (!term) {
    return rules
  }
  return rules.filter(
    (rule) =>
      rule.title.toLowerCase().includes(term)
      || (rule.body ?? '').toLowerCase().includes(term),
  )
}
