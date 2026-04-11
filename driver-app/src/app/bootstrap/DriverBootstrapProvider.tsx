import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { hydrateOrderStatesFlow } from '@/features/order-states'
import { useWorkspace } from '../providers/workspace.context'
import { DriverBootstrapContext } from './driverBootstrap.context'
import { loadDriverBootstrapQuery } from './loadDriverBootstrap.query'
import {
  createDriverBootstrapStore,
  createInitialDriverBootstrapState,
} from './driverBootstrap.store'
import {
  setDriverBootstrapError,
  setDriverBootstrapLoading,
  setDriverBootstrapReady,
} from './driverBootstrap.mutations'
import type { DriverBootstrapPayload } from './driverBootstrap.types'

const inFlightBootstraps = new Map<string, Promise<DriverBootstrapPayload>>()

export function DriverBootstrapProvider({ children }: PropsWithChildren) {
  const { workspace } = useWorkspace()
  const [store] = useState(() => createDriverBootstrapStore(createInitialDriverBootstrapState()))

  useEffect(() => {
    let cancelled = false

    async function bootstrapDriverApp() {
      if (!workspace) {
        return
      }

      setDriverBootstrapLoading(store)

      const existingBootstrap = inFlightBootstraps.get(workspace.workspaceScopeKey)
      const bootstrapPromise = existingBootstrap ?? (async () => {
        const payload = await loadDriverBootstrapQuery()
        hydrateOrderStatesFlow(payload.orderStates)
        return payload
      })()

      if (!existingBootstrap) {
        inFlightBootstraps.set(
          workspace.workspaceScopeKey,
          bootstrapPromise.finally(() => {
            inFlightBootstraps.delete(workspace.workspaceScopeKey)
          }),
        )
      }

      try {
        const payload = await bootstrapPromise

        if (cancelled) {
          return
        }

        setDriverBootstrapReady(store, payload)
      } catch (error) {
        console.error('Failed to bootstrap driver app', error)

        if (cancelled) {
          return
        }

        setDriverBootstrapError(store, 'Unable to load bootstrap data.')
      }
    }

    void bootstrapDriverApp()

    return () => {
      cancelled = true
    }
  }, [store, workspace])

  const value = useMemo(() => ({ store }), [store])

  return (
    <DriverBootstrapContext.Provider value={value}>
      {children}
    </DriverBootstrapContext.Provider>
  )
}
