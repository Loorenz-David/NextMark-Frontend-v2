export type ClientFormSettings = {
  /** `null` until the team saves for the first time — a valid loaded state, not "missing". */
  id: number | null
  client_id: string | null
  terms_enabled: boolean
  require_acceptance: boolean
  show_rules: boolean
  show_media: boolean
  updated_at: string | null
}

export type ClientFormSettingsFlag =
  | 'terms_enabled'
  | 'require_acceptance'
  | 'show_rules'
  | 'show_media'

export type ClientFormSettingsFields = Partial<Pick<ClientFormSettings, ClientFormSettingsFlag>>
