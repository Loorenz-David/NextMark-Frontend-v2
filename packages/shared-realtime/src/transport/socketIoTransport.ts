import { io, type Socket } from 'socket.io-client'

type TransportHandler = (payload: unknown) => void
type ConnectionHandler = (connected: boolean) => void

export type TransportConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'auth_failed'

export type TransportDiagnostics = {
  state: TransportConnectionState
  reconnectAttempt: number
  lastError: string | null
  lastConnectedAt: number | null
  lastDisconnectedAt: number | null
}

type EnsureConnectionOptions = {
  socketUrl: string
  token: string
}

const AUTH_REJECTION_MESSAGES = ['connection rejected', 'not authorized', 'unauthorized'] as const

const isAuthRejection = (error: Error): boolean => {
  const msg = error?.message?.toLowerCase() ?? ''
  return AUTH_REJECTION_MESSAGES.some((pattern) => msg.includes(pattern))
}

const MAX_HANDLERS_PER_EVENT = 200
const BASE_RECONNECT_DELAY_MS = 300
const MAX_RECONNECT_DELAY_MS = 5000

export class SocketIoTransport {
  private socket: Socket | null = null
  private socketUrl: string | null = null
  private token: string | null = null
  private eventHandlers = new Map<string, Map<TransportHandler, TransportHandler>>()
  private connectionHandlers = new Set<ConnectionHandler>()
  private diagnosticsHandlers = new Set<(diagnostics: TransportDiagnostics) => void>()
  private authErrorHandlers = new Set<() => void>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private diagnostics: TransportDiagnostics = {
    state: 'idle',
    reconnectAttempt: 0,
    lastError: null,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
  }

  ensureConnection({ socketUrl, token }: EnsureConnectionOptions): void {
    const requiresRebuild = !this.socket || this.socketUrl !== socketUrl || this.token !== token

    if (requiresRebuild) {
      this.rebuildSocket({ socketUrl, token })
    }

    if (!this.socket) {
      return
    }

    if (this.diagnostics.state === 'auth_failed') {
      return
    }

    if (!this.socket.connected && !this.socket.active) {
      this.updateDiagnostics({ state: this.diagnostics.reconnectAttempt > 0 ? 'reconnecting' : 'connecting' })
      this.socket.connect()
    }
  }

  disconnect(): void {
    this.clearReconnectTimer()

    if (!this.socket) {
      this.updateDiagnostics({ state: 'disconnected', lastDisconnectedAt: Date.now() })
      return
    }

    this.socket.removeAllListeners()
    this.socket.disconnect()
    this.socket = null
    this.socketUrl = null
    this.token = null
    this.updateDiagnostics({
      state: 'disconnected',
      reconnectAttempt: 0,
      lastError: null,
      lastDisconnectedAt: Date.now(),
    })
    this.emitConnectionChange(false)
  }

  isConnected(): boolean {
    return Boolean(this.socket?.connected)
  }

  getDiagnostics(): TransportDiagnostics {
    return { ...this.diagnostics }
  }

  emit(event: string, payload?: unknown): void {
    this.socket?.emit(event, payload)
  }

  on(event: string, handler: TransportHandler): () => void {
    const handlers = this.eventHandlers.get(event) ?? new Map<TransportHandler, TransportHandler>()
    if (handlers.size >= MAX_HANDLERS_PER_EVENT) {
      throw new Error(`Too many realtime handlers for event \"${event}\"`) 
    }

    const wrappedHandler: TransportHandler = (payload) => {
      try {
        handler(payload)
      } catch (error) {
        console.error('[shared-realtime] Handler execution failed for event:', event, error)
      }
    }

    handlers.set(handler, wrappedHandler)
    this.eventHandlers.set(event, handlers)
    this.socket?.on(event, wrappedHandler)

    return () => {
      const current = this.eventHandlers.get(event)
      if (!current) {
        return
      }

      const wrapped = current.get(handler)
      if (!wrapped) {
        return
      }

      current.delete(handler)
      this.socket?.off(event, wrapped)

      if (current.size === 0) {
        this.eventHandlers.delete(event)
      }
    }
  }

  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler)
    handler(this.isConnected())

    return () => {
      this.connectionHandlers.delete(handler)
    }
  }

  onDiagnosticsChange(handler: (diagnostics: TransportDiagnostics) => void): () => void {
    this.diagnosticsHandlers.add(handler)
    handler(this.getDiagnostics())

    return () => {
      this.diagnosticsHandlers.delete(handler)
    }
  }

  onAuthError(handler: () => void): () => void {
    this.authErrorHandlers.add(handler)

    return () => {
      this.authErrorHandlers.delete(handler)
    }
  }

  private rebuildSocket({ socketUrl, token }: EnsureConnectionOptions): void {
    this.clearReconnectTimer()

    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
    }

    const nextSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: false,
      withCredentials: true,
      path: '/socket.io',
      extraHeaders: { Authorization: `Bearer ${token}` },
      auth: { token },
      query: { token },
    })

    this.socket = nextSocket
    this.socketUrl = socketUrl
    this.token = token

    nextSocket.on('connect', () => {
      this.clearReconnectTimer()
      this.updateDiagnostics({
        state: 'connected',
        reconnectAttempt: 0,
        lastError: null,
        lastConnectedAt: Date.now(),
      })
      this.emitConnectionChange(true)
    })
    nextSocket.on('disconnect', (reason) => {
      this.updateDiagnostics({
        state: 'disconnected',
        lastDisconnectedAt: Date.now(),
      })
      this.emitConnectionChange(false)

      if (reason !== 'io client disconnect') {
        this.scheduleReconnect()
      }
    })
    nextSocket.on('connect_error', (error) => {
      if (isAuthRejection(error)) {
        this.clearReconnectTimer()
        this.updateDiagnostics({ state: 'auth_failed', lastError: error?.message ?? 'Auth rejected' })
        this.emitConnectionChange(false)
        this.emitAuthError()
        return
      }

      this.updateDiagnostics({
        state: 'disconnected',
        lastError: error?.message ?? 'Connection error',
      })
      this.emitConnectionChange(false)
      this.scheduleReconnect()
    })

    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach((wrappedHandler) => {
        nextSocket.on(event, wrappedHandler)
      })
    })

    this.updateDiagnostics({ state: 'connecting' })
  }

  private emitConnectionChange(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected)
      } catch (error) {
        console.error('[shared-realtime] Connection handler failed:', error)
      }
    })
  }

  private emitAuthError(): void {
    this.authErrorHandlers.forEach((handler) => {
      try {
        handler()
      } catch (error) {
        console.error('[shared-realtime] Auth error handler failed:', error)
      }
    })
  }

  private emitDiagnosticsChange(): void {
    const snapshot = this.getDiagnostics()
    this.diagnosticsHandlers.forEach((handler) => {
      try {
        handler(snapshot)
      } catch (error) {
        console.error('[shared-realtime] Diagnostics handler failed:', error)
      }
    })
  }

  private updateDiagnostics(patch: Partial<TransportDiagnostics>): void {
    this.diagnostics = {
      ...this.diagnostics,
      ...patch,
    }
    this.emitDiagnosticsChange()
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || !this.socket) {
      return
    }

    const nextAttempt = this.diagnostics.reconnectAttempt + 1
    const delayMs = Math.min(MAX_RECONNECT_DELAY_MS, BASE_RECONNECT_DELAY_MS * 2 ** Math.max(0, nextAttempt - 1))

    this.updateDiagnostics({
      state: 'reconnecting',
      reconnectAttempt: nextAttempt,
    })

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (!this.socket || this.socket.connected || this.socket.active) {
        return
      }

      if (this.diagnostics.state === 'auth_failed') {
        return
      }

      this.updateDiagnostics({ state: 'reconnecting' })
      this.socket.connect()
    }, delayMs)
  }
}
