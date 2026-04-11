import { useShallow } from 'zustand/react/shallow'

import { selectAllIntegrations, selectIntegrationByKey, useIntegrationStore } from '../store/integrationStore'

export const useIntegrations = () =>
  useIntegrationStore(useShallow(selectAllIntegrations))

export const useIntegrationByKey = (key: string | null | undefined) =>
  useIntegrationStore(selectIntegrationByKey(key))
