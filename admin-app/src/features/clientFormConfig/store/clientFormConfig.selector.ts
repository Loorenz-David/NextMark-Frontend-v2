import { useShallow } from 'zustand/react/shallow'

import {
  selectAllClientFormMedia,
  selectClientFormMediaByClientId,
  useClientFormMediaStore,
} from './clientFormMedia.store'
import {
  selectAllClientFormRules,
  selectClientFormRuleByClientId,
  useClientFormRuleStore,
} from './clientFormRules.store'
import { useClientFormSettingsStore } from './clientFormSettings.store'
import {
  selectActiveClientFormTermsVersion,
  selectAllClientFormTermsVersions,
  selectClientFormTermsVersionByClientId,
  useClientFormTermsStore,
} from './clientFormTerms.store'

export const useClientFormSettings = () => useClientFormSettingsStore((state) => state.settings)

export const useClientFormSettingsLoaded = () =>
  useClientFormSettingsStore((state) => state.isLoaded)

export const useClientFormRules = () => useClientFormRuleStore(useShallow(selectAllClientFormRules))

export const useClientFormRuleByClientId = (clientId: string | null | undefined) =>
  useClientFormRuleStore(selectClientFormRuleByClientId(clientId))

export const useClientFormMediaItems = () =>
  useClientFormMediaStore(useShallow(selectAllClientFormMedia))

export const useClientFormMediaByClientId = (clientId: string | null | undefined) =>
  useClientFormMediaStore(selectClientFormMediaByClientId(clientId))

export const useClientFormTermsVersions = () =>
  useClientFormTermsStore(useShallow(selectAllClientFormTermsVersions))

export const useActiveClientFormTermsVersion = () =>
  useClientFormTermsStore(selectActiveClientFormTermsVersion)

export const useClientFormTermsVersionByClientId = (clientId: string | null | undefined) =>
  useClientFormTermsStore(selectClientFormTermsVersionByClientId(clientId))
