import { createRealtimeClient } from '@shared-realtime'
import { sessionStorage } from '../storage/sessionStorage'
import { driverApiClient } from './client'

export const driverRealtimeClient = createRealtimeClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api_v2',
  sessionAccessor: sessionStorage,
  onAuthError: () => { void driverApiClient.refreshTokens() },
})
