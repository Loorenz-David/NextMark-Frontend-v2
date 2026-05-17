import { createRealtimeClient } from "@shared-realtime";
import { sessionStorage } from "@/features/auth/login/store/sessionStorage";
import { apiClient } from "@/lib/api/ApiClient";

export const adminRealtimeClient = createRealtimeClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api_v2",
  sessionAccessor: sessionStorage,
  onAuthError: async () => {
    const refreshed = await apiClient.refreshTokens();
    if (refreshed) {
      // Explicitly reconnect after a successful refresh. This covers the case where
      // the backend reuses the same socketToken (so the session subscription's token
      // comparison would not detect a change and would not reconnect on its own).
      adminRealtimeClient.connect();
    }
  },
});
