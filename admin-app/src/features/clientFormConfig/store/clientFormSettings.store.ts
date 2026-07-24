import { create } from 'zustand'

import type { ClientFormSettings, ClientFormSettingsFields } from '../types/clientFormSettings'

/**
 * Settings are a singleton per team, not a collection, so this is a plain slice
 * rather than a normalized entity store. `id: null` means "never saved" — the
 * PATCH endpoint upserts either way, so nothing branches on it.
 */
export const DEFAULT_CLIENT_FORM_SETTINGS: ClientFormSettings = {
  id: null,
  client_id: null,
  terms_enabled: false,
  require_acceptance: false,
  show_rules: true,
  show_media: true,
  updated_at: null,
}

type ClientFormSettingsState = {
  settings: ClientFormSettings
  isLoaded: boolean
  set: (settings: ClientFormSettings) => void
  patch: (fields: ClientFormSettingsFields & { id?: number | null }) => void
  reset: () => void
}

export const useClientFormSettingsStore = create<ClientFormSettingsState>((set) => ({
  settings: DEFAULT_CLIENT_FORM_SETTINGS,
  isLoaded: false,

  set: (settings) => set(() => ({ settings, isLoaded: true })),

  patch: (fields) =>
    set((state) => ({ settings: { ...state.settings, ...fields } })),

  reset: () => set(() => ({ settings: DEFAULT_CLIENT_FORM_SETTINGS, isLoaded: false })),
}))

export const setClientFormSettings = (settings: ClientFormSettings) =>
  useClientFormSettingsStore.getState().set(settings)

export const patchClientFormSettings = (
  fields: ClientFormSettingsFields & { id?: number | null },
) => useClientFormSettingsStore.getState().patch(fields)

export const readClientFormSettings = () => useClientFormSettingsStore.getState().settings
