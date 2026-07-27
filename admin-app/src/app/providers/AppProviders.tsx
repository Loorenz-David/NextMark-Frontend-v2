import type { PropsWithChildren } from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api/ApiClient";
import { MessageHandlerProvider, useMessageHandler } from "@shared-message-handler";
import { MobileProvider } from "@/app/providers/MobileProvider";
import { ThemeProvider } from "@/app/theme";
import { useBootstrap } from "@/features/bootstrap/bootstrap.hook";
import { useAuthSessionStore } from "@/features/auth/login/store/authSessionStore";
import { consumeAuthNotice } from "@/features/auth/login/store/authNotice";
import { AdminBusinessRealtimeProvider } from "@/realtime/business/AdminBusinessRealtimeProvider";
import { DriverLiveRealtimeProvider } from "@/realtime/driverLive/DriverLiveRealtimeProvider";
import { AdminNotificationsProvider } from "@/realtime/notifications/AdminNotificationsProvider";
import { ensureRealtimeConnected } from "@/realtime/client";
import { OrderLinkedDeviceFormProvider } from "@/features/order";
import { StepSequenceProvider } from "@/shared/overlays/stepSequence";

const DeferredAdminNotificationsPushProvider = lazy(() =>
  import("@/realtime/notifications/AdminNotificationsPushProvider").then(
    (module) => ({
      default: module.AdminNotificationsPushProvider,
    }),
  ),
);

function ApiAuthBridge() {
  const navigate = useNavigate();
  const { showMessage } = useMessageHandler();
  const { fetchBootstrap } = useBootstrap();

  useEffect(() => {
    apiClient.setUnauthenticatedHandler(() => {
      // For trusted devices with sessions remaining, evict only the failed
      // active user and reload as a fallback user. Otherwise redirect to login.
      const evicted = useAuthSessionStore.getState().handleTerminalAuthFailure();
      if (!evicted) {
        navigate("/auth/login", { replace: true });
      }
    });
  }, [navigate]);

  useEffect(() => {
    // Surface a one-shot notice that survived an involuntary user eviction.
    const notice = consumeAuthNotice();
    if (notice) {
      showMessage({ status: 200, message: notice });
    }
  }, [showMessage]);

  useEffect(() => {
    if (apiClient.getAccessToken()) {
      void fetchBootstrap();
      // Guarantee the socket has a token for the active session — mints one when
      // a switched-in trusted-device user has no socket token yet.
      void ensureRealtimeConnected();
    }
  }, [fetchBootstrap]);

  return null;
}

function DeferredAppEnhancers() {
  const [shouldMountEnhancers, setShouldMountEnhancers] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(() => {
        setShouldMountEnhancers(true);
      });

      return () => {
        window.cancelIdleCallback(handle);
      };
    }

    const timeoutId = globalThis.setTimeout(() => {
      setShouldMountEnhancers(true);
    }, 150);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, []);

  if (!shouldMountEnhancers) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <DeferredAdminNotificationsPushProvider />
      {/* Re-enable admin AI here later by restoring the deferred AdminAiPanelProvider import and mounting it in this enhancer block. */}
    </Suspense>
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  const session = useAuthSessionStore((state) => state.session);
  const employeeUserId = Number(
    session?.user?.id ??
      (session as { userId?: string | number | null } | null)?.userId ??
      -1,
  );

  return (
    <ThemeProvider>
      <BrowserRouter>
        <MobileProvider>
          <MessageHandlerProvider defaultMessageDurationMs={8000} maxMessages={2}>
            <AdminNotificationsProvider>
              <AdminBusinessRealtimeProvider>
                <DriverLiveRealtimeProvider>
                  <OrderLinkedDeviceFormProvider
                    employeeUserId={employeeUserId}
                  >
                    <StepSequenceProvider>
                      <ApiAuthBridge />
                      {children}
                      <DeferredAppEnhancers />
                    </StepSequenceProvider>
                  </OrderLinkedDeviceFormProvider>
                </DriverLiveRealtimeProvider>
              </AdminBusinessRealtimeProvider>
            </AdminNotificationsProvider>
          </MessageHandlerProvider>
        </MobileProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
