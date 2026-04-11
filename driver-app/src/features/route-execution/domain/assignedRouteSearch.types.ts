import type { address } from '@shared-domain'

export type TeamStopSearchResult = {
  id: string
  kind: 'team-stop'
  stopClientId: string
  title: string
  subtitle: string | null
  badgeLabel: string | null
}

export type PersonalAddressSearchResult = {
  id: string
  kind: 'personal-address'
  placeId: string
  title: string
  subtitle: string | null
}

export type RouteSearchResult = TeamStopSearchResult | PersonalAddressSearchResult

export type ResolvedSearchAddress = address
