import { createRealtimeClient } from '@shared-realtime'
import { sessionStorage } from '@/features/auth/login/store/sessionStorage'
import { apiClient } from '@/lib/api/ApiClient'

export const adminRealtimeClient = createRealtimeClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api_v2',
  sessionAccessor: sessionStorage,
  onAuthError: () => { void apiClient.refreshTokens() },
})
