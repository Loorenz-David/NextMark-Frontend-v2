import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { apiClient } from '@/lib/api/ApiClient'
import { MessageHandlerProvider } from '@shared-message-handler'
import { MobileProvider } from '@/app/providers/MobileProvider'
import { useBootstrap } from '@/features/bootstrap/bootstrap.hook'
import { AdminAiPanelProvider } from '@/features/ai'
import { AdminBusinessRealtimeProvider } from '@/realtime/business'
import { DriverLiveRealtimeProvider } from '@/realtime/driverLive'
import {
  AdminNotificationsProvider,
  AdminNotificationsPushProvider,
} from '@/realtime/notifications'

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

export function AppProviders({ children }: PropsWithChildren) {

  
  return (
    <BrowserRouter>
      <MobileProvider>
        <MessageHandlerProvider
          defaultMessageDurationMs={8000}
          maxMessages={2}
        >
          <AdminAiPanelProvider>
            <AdminNotificationsPushProvider>
              <AdminNotificationsProvider>
                <AdminBusinessRealtimeProvider>
                  <DriverLiveRealtimeProvider>
                    <ApiAuthBridge />
                    {children}
                  </DriverLiveRealtimeProvider>
                </AdminBusinessRealtimeProvider>
              </AdminNotificationsProvider>
            </AdminNotificationsPushProvider>
          </AdminAiPanelProvider>
        </MessageHandlerProvider>
      </MobileProvider>
    </BrowserRouter>
  )
}
