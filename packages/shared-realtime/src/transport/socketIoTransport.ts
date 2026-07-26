import { io, type Socket } from "socket.io-client";

type TransportHandler = (payload: unknown) => void;
type ConnectionHandler = (connected: boolean) => void;

export type TransportConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "auth_failed";

export type TransportDiagnostics = {
  state: TransportConnectionState;
  reconnectAttempt: number;
  lastError: string | null;
  lastConnectedAt: number | null;
  lastDisconnectedAt: number | null;
};

type EnsureConnectionOptions = {
  socketUrl: string;
  token: string;
};

const AUTH_REJECTION_MESSAGES = [
  "connection rejected",
  "not authorized",
  "unauthorized",
  "token expired",
  "jwt expired",
  "expired token",
  "invalid token",
  "authentication failed",
  "authentication error",
] as const;

const isAuthRejection = (error: Error): boolean => {
  const msg = error?.message?.toLowerCase() ?? "";
  return AUTH_REJECTION_MESSAGES.some((pattern) => msg.includes(pattern));
};

// engine.io-client is a transitive dependency, so its Engine type cannot be
// imported here; the structural type is limited to the single `on` we use.
type EngineLike = {
  on: (event: string, handler: (...args: unknown[]) => void) => void;
};

const MAX_HANDLERS_PER_EVENT = 200;
const BASE_RECONNECT_DELAY_MS = 300;
const MAX_RECONNECT_DELAY_MS = 5000;
// The server pings roughly every 25s (engine.io v4). A "connected" socket that
// has received no engine traffic for this long is dead under us — the OS kept
// the TCP session alive across a sleep or network switch, but nothing arrives.
const STALE_CONNECTION_THRESHOLD_MS = 60_000;
const WATCHDOG_INTERVAL_MS = 15_000;

export class SocketIoTransport {
  private socket: Socket | null = null;
  private socketUrl: string | null = null;
  private token: string | null = null;
  // True from ensureConnection until an explicit disconnect(): the watchdog and
  // health checks only ever act while a connection is actually wanted, so a
  // logout can never be "recovered" back into a live socket.
  private desiredConnected = false;
  private lastActivityAt = 0;
  private watchdogTimer: ReturnType<typeof setInterval> | null = null;
  private eventHandlers = new Map<
    string,
    Map<TransportHandler, TransportHandler>
  >();
  private connectionHandlers = new Set<ConnectionHandler>();
  private diagnosticsHandlers = new Set<
    (diagnostics: TransportDiagnostics) => void
  >();
  private authErrorHandlers = new Set<() => void>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private diagnostics: TransportDiagnostics = {
    state: "idle",
    reconnectAttempt: 0,
    lastError: null,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
  };

  ensureConnection({ socketUrl, token }: EnsureConnectionOptions): void {
    this.desiredConnected = true;

    // Rebuild on token/url change OR to recover from a previous auth_failed state,
    // so an explicit reconnect after a successful token refresh always gets a clean socket.
    const requiresRebuild =
      !this.socket ||
      this.socketUrl !== socketUrl ||
      this.token !== token ||
      this.diagnostics.state === "auth_failed";

    if (requiresRebuild) {
      this.rebuildSocket({ socketUrl, token });
    }

    if (!this.socket) {
      return;
    }

    if (!this.socket.connected && !this.socket.active) {
      this.updateDiagnostics({
        state:
          this.diagnostics.reconnectAttempt > 0 ? "reconnecting" : "connecting",
      });
      this.socket.connect();
    }

    this.startWatchdog();
  }

  disconnect(): void {
    this.desiredConnected = false;
    this.stopWatchdog();
    this.clearReconnectTimer();

    if (!this.socket) {
      this.updateDiagnostics({
        state: "disconnected",
        lastDisconnectedAt: Date.now(),
      });
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.socketUrl = null;
    this.token = null;
    this.updateDiagnostics({
      state: "disconnected",
      reconnectAttempt: 0,
      lastError: null,
      lastDisconnectedAt: Date.now(),
    });
    this.emitConnectionChange(false);
  }

  isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }

  /**
   * Actively checks that the connection is what it claims to be, recovering the
   * three states timers alone cannot be trusted to escape:
   *
   * - A "connected" socket with no engine traffic inside the stale window is a
   *   zombie (TCP kept alive across a sleep or network switch) — rebuilt and
   *   reconnected immediately rather than waiting on the engine's own timeout,
   *   during which both ends look healthy but are deaf.
   * - A disconnected socket with no retry pending had its reconnect loop
   *   dead-end — the loop is restarted.
   * - With `immediate` (the wake-up path: tab became visible, network came
   *   back), any backoff still pending is skipped and the connect is issued now.
   *
   * `auth_failed` is deliberately left alone: only ensureConnection with a
   * (possibly refreshed) token exits that state, so a health check can never
   * hammer the server with a token it already rejected.
   */
  verifyHealth(immediate = false): void {
    if (!this.desiredConnected || !this.socket) {
      return;
    }
    if (this.diagnostics.state === "auth_failed") {
      return;
    }

    if (this.socket.connected) {
      const idleMs = Date.now() - this.lastActivityAt;
      if (idleMs > STALE_CONNECTION_THRESHOLD_MS) {
        const socketUrl = this.socketUrl;
        const token = this.token;
        if (socketUrl && token) {
          this.updateDiagnostics({ lastError: "Stale connection replaced" });
          this.rebuildSocket({ socketUrl, token });
          this.updateDiagnostics({ state: "reconnecting" });
          this.socket?.connect();
        }
      }
      return;
    }

    if (immediate) {
      this.clearReconnectTimer();
      if (!this.socket.active) {
        this.updateDiagnostics({ state: "reconnecting" });
        this.socket.connect();
      }
      return;
    }

    if (!this.socket.active && !this.reconnectTimer) {
      this.scheduleReconnect();
    }
  }

  getDiagnostics(): TransportDiagnostics {
    return { ...this.diagnostics };
  }

  emit(event: string, payload?: unknown): void {
    this.socket?.emit(event, payload);
  }

  on(event: string, handler: TransportHandler): () => void {
    const handlers =
      this.eventHandlers.get(event) ??
      new Map<TransportHandler, TransportHandler>();
    if (handlers.size >= MAX_HANDLERS_PER_EVENT) {
      throw new Error(`Too many realtime handlers for event \"${event}\"`);
    }

    const wrappedHandler: TransportHandler = (payload) => {
      try {
        handler(payload);
      } catch (error) {
        console.error(
          "[shared-realtime] Handler execution failed for event:",
          event,
          error,
        );
      }
    };

    handlers.set(handler, wrappedHandler);
    this.eventHandlers.set(event, handlers);
    this.socket?.on(event, wrappedHandler);

    return () => {
      const current = this.eventHandlers.get(event);
      if (!current) {
        return;
      }

      const wrapped = current.get(handler);
      if (!wrapped) {
        return;
      }

      current.delete(handler);
      this.socket?.off(event, wrapped);

      if (current.size === 0) {
        this.eventHandlers.delete(event);
      }
    };
  }

  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    handler(this.isConnected());

    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  onDiagnosticsChange(
    handler: (diagnostics: TransportDiagnostics) => void,
  ): () => void {
    this.diagnosticsHandlers.add(handler);
    handler(this.getDiagnostics());

    return () => {
      this.diagnosticsHandlers.delete(handler);
    };
  }

  onAuthError(handler: () => void): () => void {
    this.authErrorHandlers.add(handler);

    return () => {
      this.authErrorHandlers.delete(handler);
    };
  }

  private rebuildSocket({ socketUrl, token }: EnsureConnectionOptions): void {
    this.clearReconnectTimer();

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    const nextSocket = io(socketUrl, {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: false,
      withCredentials: true,
      path: "/socket.io",
      extraHeaders: { Authorization: `Bearer ${token}` },
      auth: { token },
      query: { token },
    });

    this.socket = nextSocket;
    this.socketUrl = socketUrl;
    this.token = token;

    nextSocket.on("connect", () => {
      this.clearReconnectTimer();
      this.lastActivityAt = Date.now();
      this.trackEngineActivity();
      this.updateDiagnostics({
        state: "connected",
        reconnectAttempt: 0,
        lastError: null,
        lastConnectedAt: Date.now(),
      });
      this.emitConnectionChange(true);
    });
    nextSocket.on("disconnect", (reason) => {
      this.updateDiagnostics({
        state: "disconnected",
        lastDisconnectedAt: Date.now(),
      });
      this.emitConnectionChange(false);

      if (reason !== "io client disconnect") {
        this.scheduleReconnect();
      }
    });
    nextSocket.on("connect_error", (error) => {
      if (isAuthRejection(error)) {
        this.clearReconnectTimer();
        this.updateDiagnostics({
          state: "auth_failed",
          lastError: error?.message ?? "Auth rejected",
        });
        this.emitConnectionChange(false);
        this.emitAuthError();
        return;
      }

      this.updateDiagnostics({
        state: "disconnected",
        lastError: error?.message ?? "Connection error",
      });
      this.emitConnectionChange(false);
      this.scheduleReconnect();
    });

    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach((wrappedHandler) => {
        nextSocket.on(event, wrappedHandler);
      });
    });

    this.updateDiagnostics({ state: "connecting" });
  }

  /**
   * Stamps `lastActivityAt` on every engine-level packet — which includes the
   * server's periodic pings, so a healthy-but-idle connection keeps proving it
   * is alive without any application traffic. A fresh engine is created per
   * (re)connection, so attaching inside the `connect` handler never duplicates
   * listeners.
   */
  private trackEngineActivity(): void {
    const engine = (
      this.socket?.io as unknown as { engine?: EngineLike } | undefined
    )?.engine;
    engine?.on("packet", () => {
      this.lastActivityAt = Date.now();
    });
  }

  private startWatchdog(): void {
    if (this.watchdogTimer) {
      return;
    }
    this.watchdogTimer = setInterval(
      () => this.verifyHealth(),
      WATCHDOG_INTERVAL_MS,
    );
  }

  private stopWatchdog(): void {
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private emitConnectionChange(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected);
      } catch (error) {
        console.error("[shared-realtime] Connection handler failed:", error);
      }
    });
  }

  private emitAuthError(): void {
    this.authErrorHandlers.forEach((handler) => {
      try {
        handler();
      } catch (error) {
        console.error("[shared-realtime] Auth error handler failed:", error);
      }
    });
  }

  private emitDiagnosticsChange(): void {
    const snapshot = this.getDiagnostics();
    this.diagnosticsHandlers.forEach((handler) => {
      try {
        handler(snapshot);
      } catch (error) {
        console.error("[shared-realtime] Diagnostics handler failed:", error);
      }
    });
  }

  private updateDiagnostics(patch: Partial<TransportDiagnostics>): void {
    this.diagnostics = {
      ...this.diagnostics,
      ...patch,
    };
    this.emitDiagnosticsChange();
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || !this.socket) {
      return;
    }

    const nextAttempt = this.diagnostics.reconnectAttempt + 1;
    const backoffMs = Math.min(
      MAX_RECONNECT_DELAY_MS,
      BASE_RECONNECT_DELAY_MS * 2 ** Math.max(0, nextAttempt - 1),
    );
    // Jitter spreads a fleet of devices reconnecting after a shared outage.
    const delayMs = backoffMs * (0.7 + Math.random() * 0.3);

    this.updateDiagnostics({
      state: "reconnecting",
      reconnectAttempt: nextAttempt,
    });

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.socket || this.socket.connected) {
        return;
      }

      if (this.diagnostics.state === "auth_failed") {
        return;
      }

      if (this.socket.active) {
        // A connect attempt is already in flight. Keep the loop alive instead
        // of abandoning it: if that attempt dies without firing an event
        // (timers frozen during sleep, a network change mid-handshake), this
        // rescheduled retry is the only thing that ever runs again.
        this.scheduleReconnect();
        return;
      }

      this.updateDiagnostics({ state: "reconnecting" });
      this.socket.connect();
    }, delayMs);
  }
}
