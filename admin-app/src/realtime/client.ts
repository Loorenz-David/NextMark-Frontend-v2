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

/**
 * Ensures the socket is connected for the currently-active session, minting a
 * socket token when one is missing.
 *
 * `connect()` returns false and does nothing when the active session has no
 * `socketToken`. That happens after switching to a trusted-device user whose
 * login bundle carried no socket token (socket tokens are short-lived and are
 * typically issued only for the initiating user). Without a token there is no
 * connection attempt and therefore no auth error to trigger the `onAuthError`
 * recovery — so the socket would stay dead until the next full login.
 *
 * Here we detect "authenticated but no socket token" and mint a fresh one via the
 * standard refresh endpoint (which also returns a socket_token), then connect.
 * When a socket token IS present, `connect()` succeeds and any expiry is handled
 * by the existing `onAuthError` path, so no refresh happens on a normal boot.
 */
export const ensureRealtimeConnected = async (): Promise<void> => {
  if (!apiClient.getAccessToken()) {
    return;
  }
  if (adminRealtimeClient.connect()) {
    return;
  }
  const refreshed = await apiClient.refreshTokens();
  if (refreshed) {
    adminRealtimeClient.connect();
  }
};
