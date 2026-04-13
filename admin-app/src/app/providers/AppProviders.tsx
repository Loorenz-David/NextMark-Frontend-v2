import type { PropsWithChildren } from 'react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { apiClient } from '@/lib/api/ApiClient'
import { MessageHandlerProvider } from '@shared-message-handler'
import { MobileProvider } from '@/app/providers/MobileProvider'
import { useBootstrap } from '@/features/bootstrap/bootstrap.hook'
import { AdminBusinessRealtimeProvider } from '@/realtime/business/AdminBusinessRealtimeProvider'
import { DriverLiveRealtimeProvider } from '@/realtime/driverLive/DriverLiveRealtimeProvider'
import { AdminNotificationsProvider } from '@/realtime/notifications/AdminNotificationsProvider'

const DeferredAdminAiPanelProvider = lazy(() =>
  import('@/features/ai/providers/AdminAiPanelProvider').then((module) => ({
    default: module.AdminAiPanelProvider,
  })),
)
const DeferredAdminNotificationsPushProvider = lazy(() =>
  import('@/realtime/notifications/AdminNotificationsPushProvider').then((module) => ({
    default: module.AdminNotificationsPushProvider,
  })),
)

function ApiAuthBridge() {
  const navigate = useNavigate()
  const { fetchBootstrap } = useBootstrap()

  useEffect(() => {
    apiClient.setUnauthenticatedHandler(() => {
      navigate('/auth/login', { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    if (apiClient.getAccessToken()) {
      void fetchBootstrap()
    }
  }, [fetchBootstrap])

  return null
}

function DeferredAppEnhancers() {
  const [shouldMountEnhancers, setShouldMountEnhancers] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(() => {
        setShouldMountEnhancers(true)
      })

      return () => {
        window.cancelIdleCallback(handle)
      }
    }

    const timeoutId = globalThis.setTimeout(() => {
      setShouldMountEnhancers(true)
    }, 150)

    return () => {
      globalThis.clearTimeout(timeoutId)
    }
  }, [])

  if (!shouldMountEnhancers) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <DeferredAdminNotificationsPushProvider />
      <DeferredAdminAiPanelProvider />
    </Suspense>
  )
}

export function AppProviders({ children }: PropsWithChildren) {

  
  return (
    <BrowserRouter>
      <MobileProvider>
        <MessageHandlerProvider
          defaultMessageDurationMs={8000}
          maxMessages={2}
        >
          <AdminNotificationsProvider>
            <AdminBusinessRealtimeProvider>
              <DriverLiveRealtimeProvider>
                <ApiAuthBridge />
                {children}
                <DeferredAppEnhancers />
              </DriverLiveRealtimeProvider>
            </AdminBusinessRealtimeProvider>
          </AdminNotificationsProvider>
        </MessageHandlerProvider>
      </MobileProvider>
    </BrowserRouter>
  )
}
