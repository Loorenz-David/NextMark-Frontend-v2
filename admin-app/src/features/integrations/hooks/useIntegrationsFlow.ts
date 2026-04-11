import { useCallback, useEffect, useMemo, useState } from 'react'

import { integrationsBootstrapApi } from '../api/integrationsBootstrapApi'
import { useIntegrationsModel } from '../domain/useIntegrationsModel'
import type { IntegrationDefinitionWithStatus } from '../types/integration'
import type { IntegrationBootstrapValue } from '../api/integrationsBootstrapApi'

export const useIntegrationsFlow = () => {
  const { definitions } = useIntegrationsModel()
  const initialIntegrations = useMemo<IntegrationDefinitionWithStatus[]>(
    () =>
      definitions.map((definition) => ({
        ...definition,
        id: null,
        isActive: false,
      })),
    [definitions],
  )
  const [integrations, setIntegrations] = useState<IntegrationDefinitionWithStatus[]>(initialIntegrations)


  const refreshIntegrations = useCallback(async () => {
    try {
      const response = await integrationsBootstrapApi.getActiveIntegrations()
      const active = response.data

      const resolveId = (value: IntegrationBootstrapValue | undefined) => {
        if (typeof value === 'number') {
          return value
        }
        if (value && typeof value === 'object' && 'id' in value) {
          return value.id
        }
        return null
      }

      setIntegrations(
        definitions.map((definition) => {
          const id = resolveId(active[definition.key])
          return {
            ...definition,
            id,
            isActive: Boolean(id),
          }
        }),
      )
    } catch (error) {
      console.error('Failed to load integrations bootstrap', error)
    }
  }, [definitions])

  const clearIntegration = useCallback((key: IntegrationDefinitionWithStatus['key']) => {
    setIntegrations((prev) =>
      prev.map((definition) =>
        definition.key === key
          ? { ...definition, id: null, isActive: false }
          : definition,
      ),
    )
  }, [])

  useEffect(() => {
    let isMounted = true
    const bootstrapIntegrations = async () => {
      if (!isMounted) {
        return
      }
      await refreshIntegrations()
    }

    void bootstrapIntegrations()
    return () => {
      isMounted = false
    }
  }, [refreshIntegrations])

  return { integrations, refreshIntegrations, clearIntegration }
}
