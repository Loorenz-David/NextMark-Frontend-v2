import type { PropsWithChildren } from 'react'
import { DriverBootstrapProvider } from '@/app/bootstrap'
import { DriverRouteTimingProvider } from '@/app/route-timing'
import { DriverAppShellProvider } from '@/app/shell'
import { MessageHandlerProvider } from '@shared-message-handler'
import { DriverLiveLocationProvider } from './DriverLiveLocationProvider'
import { DriverNotificationsProvider } from '@/app/notifications'
import { DriverRealtimeProvider } from './DriverRealtimeProvider'
import { ConnectivityProvider } from './ConnectivityProvider'
import { DriverServicesProvider } from './DriverServicesProvider'
import { RouteExecutionShellProvider } from '@/features/route-execution'
import { SessionProvider } from './SessionProvider'
import { WorkspaceProvider } from './WorkspaceProvider'
import { useWorkspace } from './workspace.context'

function WorkspaceScopedProviders({ children }: PropsWithChildren) {
  const { workspace } = useWorkspace()
  const workspaceScopeKey = workspace?.workspaceScopeKey ?? 'anonymous'

  return (
    <DriverBootstrapProvider key={workspaceScopeKey}>
      <DriverAppShellProvider>
        <RouteExecutionShellProvider>
          <DriverRouteTimingProvider>
            <DriverRealtimeProvider>
              <DriverLiveLocationProvider>
                <DriverNotificationsProvider>{children}</DriverNotificationsProvider>
              </DriverLiveLocationProvider>
            </DriverRealtimeProvider>
          </DriverRouteTimingProvider>
        </RouteExecutionShellProvider>
      </DriverAppShellProvider>
    </DriverBootstrapProvider>
  )
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConnectivityProvider>
      <MessageHandlerProvider
        defaultMessageDurationMs={4000}
        maxMessages={1}
      >
        <DriverServicesProvider>
          <SessionProvider>
            <WorkspaceProvider>
              <WorkspaceScopedProviders>{children}</WorkspaceScopedProviders>
            </WorkspaceProvider>
          </SessionProvider>
        </DriverServicesProvider>
      </MessageHandlerProvider>
    </ConnectivityProvider>
  )
}
