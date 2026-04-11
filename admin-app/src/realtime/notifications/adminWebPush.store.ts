import type {
  AdminNotificationLaunchPayload,
  AdminWebPushSnapshot,
} from "./adminWebPush.types";

type Listener = () => void;

const createSnapshot = (): AdminWebPushSnapshot => ({
  status: "permission_default",
  permission: "default",
  isSupported: false,
  isLoading: false,
  endpoint: null,
  errorMessage: null,
});

class AdminWebPushStore {
  private listeners = new Set<Listener>();
  private snapshot: AdminWebPushSnapshot = createSnapshot();

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  setSnapshot = (next: Partial<AdminWebPushSnapshot>) => {
    this.snapshot = { ...this.snapshot, ...next };
    this.emit();
  };

  reset = () => {
    this.snapshot = createSnapshot();
    this.emit();
  };

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}

class AdminNotificationLaunchStore {
  private listeners = new Set<Listener>();
  private pendingLaunchPayload: AdminNotificationLaunchPayload | null = null;
  private pendingWorkspacePayload:
    | {
        planId: number;
        freshAfter?: string | null;
      }
    | null = null;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => ({
    pendingLaunchPayload: this.pendingLaunchPayload,
    pendingWorkspacePayload: this.pendingWorkspacePayload,
  });

  setPendingLaunchPayload = (payload: AdminNotificationLaunchPayload | null) => {
    this.pendingLaunchPayload = payload;
    this.emit();
  };

  consumePendingLaunchPayload = () => {
    const current = this.pendingLaunchPayload;
    this.pendingLaunchPayload = null;
    this.emit();
    return current;
  };

  setPendingWorkspacePayload = (
    payload:
      | {
          planId: number;
          freshAfter?: string | null;
        }
      | null,
  ) => {
    this.pendingWorkspacePayload = payload;
    this.emit();
  };

  consumePendingWorkspacePayload = () => {
    const current = this.pendingWorkspacePayload;
    this.pendingWorkspacePayload = null;
    this.emit();
    return current;
  };

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const adminWebPushStore = new AdminWebPushStore();
export const adminNotificationLaunchStore = new AdminNotificationLaunchStore();

export const subscribeAdminWebPush = adminWebPushStore.subscribe;
export const getAdminWebPushSnapshot = adminWebPushStore.getSnapshot;
export const setAdminWebPushSnapshot = adminWebPushStore.setSnapshot;
export const resetAdminWebPushSnapshot = adminWebPushStore.reset;

export const subscribeAdminNotificationLaunch =
  adminNotificationLaunchStore.subscribe;
export const getAdminNotificationLaunchSnapshot =
  adminNotificationLaunchStore.getSnapshot;
export const setPendingAdminNotificationLaunchPayload =
  adminNotificationLaunchStore.setPendingLaunchPayload;
export const consumePendingAdminNotificationLaunchPayload =
  adminNotificationLaunchStore.consumePendingLaunchPayload;
export const setPendingAdminNotificationWorkspacePayload =
  adminNotificationLaunchStore.setPendingWorkspacePayload;
export const consumePendingAdminNotificationWorkspacePayload =
  adminNotificationLaunchStore.consumePendingWorkspacePayload;
