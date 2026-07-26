import type { SessionAccessor, SessionSnapshot } from '@shared-api'
import {
  REALTIME_CLIENT_EVENTS,
  type RealtimeChannelId,
  type RealtimeChannelParamsMap,
  type RealtimeSubscriptionPayload,
} from '../contracts'
import { SocketIoTransport, type TransportDiagnostics } from '../transport/socketIoTransport'

type SessionSource = SessionAccessor & {
  subscribe?: (listener: (session: SessionSnapshot | null) => void) => () => void
}

type RealtimeClientConfig = {
  baseUrl: string
  sessionAccessor: SessionSource
  onAuthError?: () => void | Promise<void>
}

export type RealtimeSubscriptionStatus = 'pending' | 'active' | 'releasing'

export type RealtimeClientDiagnostics = {
  transport: TransportDiagnostics
  subscriptions: {
    total: number
    active: number
    pending: number
    releasing: number
  }
}

type SubscriptionRecord = {
  channel: RealtimeChannelId
  params: RealtimeChannelParamsMap[RealtimeChannelId] | undefined
  count: number
  status: RealtimeSubscriptionStatus
}

const MAX_SUBSCRIPTIONS = 1000
const MAX_PENDING_CRITICAL_EMITS = 20
const DEFAULT_CRITICAL_EMIT_TTL_MS = 30_000

type PendingCriticalEmit = {
  event: string
  payload: unknown
  expiresAt: number
}

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right))
    return `{${entries.map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`).join(',')}}`
  }

  return JSON.stringify(value)
}

const buildSubscriptionKey = <Channel extends RealtimeChannelId>(
  channel: Channel,
  params?: RealtimeChannelParamsMap[Channel],
) => `${channel}:${stableStringify(params ?? {})}`

const deriveSocketUrl = (baseUrl: string): string => {
  const normalizedBaseUrl = baseUrl.trim()
  const explicitSocketUrl = (import.meta.env.VITE_SOCKET_URL as string | undefined)?.trim()
  if (explicitSocketUrl) {
    return explicitSocketUrl
  }

  try {
    const parsed = new URL(normalizedBaseUrl)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return normalizedBaseUrl
  }
}

export class SharedRealtimeClient {
  private readonly baseUrl: string
  private readonly sessionAccessor: SessionSource
  private readonly transport = new SocketIoTransport()
  private readonly subscriptions = new Map<string, SubscriptionRecord>()
  // Fire-and-forget room joins that carry no channel params and so cannot use
  // the subscription-record protocol (e.g. the team-scoped external-form room,
  // whose room the backend derives from the socket's claims). Kept here so they
  // are replayed on every reconnect exactly like tracked subscriptions —
  // otherwise a transient drop silently ejects the socket from the room while
  // the connection itself looks healthy.
  private readonly rejoinEmits = new Map<string, unknown>()
  // Emits that must not be silently lost to a disconnected socket, held until
  // the next successful connection and dropped once their TTL passes.
  private readonly pendingCriticalEmits: PendingCriticalEmit[] = []
  private readonly diagnosticsHandlers = new Set<(diagnostics: RealtimeClientDiagnostics) => void>()
  private currentSocketToken: string | null = null
  private readonly removeSessionListener?: () => void
  private readonly removeLifecycleListeners?: () => void
  private removeTransportDiagnosticsListener?: () => void

  constructor(config: RealtimeClientConfig) {
    this.baseUrl = config.baseUrl
    this.sessionAccessor = config.sessionAccessor

    this.transport.onConnectionChange((connected) => {
      if (connected) {
        this.resubscribeAll()
        this.replayRejoins()
        // After rejoins, so a queued emit never races its own room membership.
        this.flushCriticalEmits()
      } else {
        this.markSubscriptionsPending()
      }

      this.emitDiagnosticsChange()
    })

    this.removeTransportDiagnosticsListener = this.transport.onDiagnosticsChange(() => {
      this.emitDiagnosticsChange()
    })

    if (typeof config.onAuthError === 'function') {
      this.transport.onAuthError(() => {
        void config.onAuthError!()
      })
    }

    if (typeof this.sessionAccessor.subscribe === 'function') {
      this.removeSessionListener = this.sessionAccessor.subscribe((session) => {
        const nextToken = session?.socketToken ?? null

        if (!nextToken) {
          this.currentSocketToken = null
          this.transport.disconnect()
          this.emitDiagnosticsChange()
          return
        }

        if (nextToken !== this.currentSocketToken) {
          this.connect()
        }
      })
    }

    // Timers alone cannot be trusted to recover the connection: browsers
    // throttle them in background tabs and freeze them during sleep. These
    // events fire at exactly the moments the machine comes back — reconnect
    // immediately with whatever token the session holds now (connect() also
    // exits auth_failed by rebuilding), then actively verify the socket is not
    // a zombie left over from the sleep.
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const handleWake = () => {
        this.connect()
        this.transport.verifyHealth(true)
      }
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          handleWake()
        }
      }
      window.addEventListener('online', handleWake)
      window.addEventListener('focus', handleWake)
      document.addEventListener('visibilitychange', handleVisibilityChange)
      this.removeLifecycleListeners = () => {
        window.removeEventListener('online', handleWake)
        window.removeEventListener('focus', handleWake)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }

  connect(): boolean {
    const nextToken = this.sessionAccessor.getSession()?.socketToken ?? null
    if (!nextToken) {
      this.emitDiagnosticsChange()
      return false
    }

    this.currentSocketToken = nextToken
    this.transport.ensureConnection({
      socketUrl: deriveSocketUrl(this.baseUrl),
      token: nextToken,
    })

    this.emitDiagnosticsChange()

    return true
  }

  disconnect(): void {
    this.currentSocketToken = null
    this.transport.disconnect()
    this.markSubscriptionsPending()
    this.emitDiagnosticsChange()
  }

  destroy(): void {
    this.removeTransportDiagnosticsListener?.()
    this.removeSessionListener?.()
    this.removeLifecycleListeners?.()
    this.diagnosticsHandlers.clear()
    this.disconnect()
  }

  isConnected(): boolean {
    return this.transport.isConnected()
  }

  on<TPayload>(event: string, handler: (payload: TPayload) => void): () => void {
    const release = this.transport.on(event, (payload) => {
      try {
        handler(payload as TPayload)
      } catch (error) {
        console.error('[shared-realtime] Realtime handler failed for event:', event, error)
      }
    })
    this.connect()
    return release
  }

  getDiagnostics(): RealtimeClientDiagnostics {
    const subscriptions = {
      total: this.subscriptions.size,
      active: 0,
      pending: 0,
      releasing: 0,
    }

    this.subscriptions.forEach((record) => {
      if (record.status === 'active') {
        subscriptions.active += 1
      } else if (record.status === 'pending') {
        subscriptions.pending += 1
      } else {
        subscriptions.releasing += 1
      }
    })

    return {
      transport: this.transport.getDiagnostics(),
      subscriptions,
    }
  }

  onDiagnosticsChange(handler: (diagnostics: RealtimeClientDiagnostics) => void): () => void {
    this.diagnosticsHandlers.add(handler)
    handler(this.getDiagnostics())

    return () => {
      this.diagnosticsHandlers.delete(handler)
    }
  }

  subscribe<Channel extends RealtimeChannelId>(
    channel: Channel,
    params?: RealtimeChannelParamsMap[Channel],
  ): () => void {
    const key = buildSubscriptionKey(channel, params)
    const existing = this.subscriptions.get(key)

    if (existing) {
      existing.count += 1

      if (this.transport.isConnected() && existing.status !== 'active') {
        this.emitSubscribe(existing.channel, existing.params)
        existing.status = 'active'
      }

      this.emitDiagnosticsChange()
      return () => {
        this.unsubscribe(channel, params)
      }
    }

    if (this.subscriptions.size >= MAX_SUBSCRIPTIONS) {
      throw new Error('Too many realtime subscriptions registered')
    }

    const record: SubscriptionRecord = {
      channel,
      params: params as RealtimeChannelParamsMap[RealtimeChannelId] | undefined,
      count: 1,
      status: 'pending',
    }

    this.subscriptions.set(key, record)

    this.connect()

    if (this.transport.isConnected()) {
      this.emitSubscribe(channel, params)
      record.status = 'active'
    }

    this.emitDiagnosticsChange()

    return () => {
      this.unsubscribe(channel, params)
    }
  }

  unsubscribe<Channel extends RealtimeChannelId>(
    channel: Channel,
    params?: RealtimeChannelParamsMap[Channel],
  ): void {
    const key = buildSubscriptionKey(channel, params)
    const existing = this.subscriptions.get(key)
    if (!existing) {
      return
    }

    existing.count -= 1
    if (existing.count > 0) {
      this.emitDiagnosticsChange()
      return
    }

    const wasActive = existing.status === 'active'
    existing.status = 'releasing'

    if (wasActive && this.transport.isConnected()) {
      this.transport.emit(REALTIME_CLIENT_EVENTS.unsubscribe, {
        channel,
        params,
      } satisfies RealtimeSubscriptionPayload<Channel>)
    }

    this.subscriptions.delete(key)
    this.emitDiagnosticsChange()
  }

  publish<TPayload>(event: string, payload: TPayload): void {
    this.connect()
    this.transport.emit(event, payload)
  }

  /**
   * Publishes an event that must not be silently lost to a disconnected socket.
   *
   * Connected: emits immediately, exactly like {@link publish}. Disconnected:
   * holds the payload and replays it on the next successful connection (after
   * room rejoins), dropping it once `ttlMs` passes — a form request delivered
   * minutes late is worse than one the user visibly retried. Plain publish
   * remains correct for best-effort traffic like progress frames, where the
   * next snapshot supersedes a lost one.
   */
  publishCritical<TPayload>(
    event: string,
    payload: TPayload,
    options: { ttlMs?: number } = {},
  ): void {
    this.connect()

    if (this.transport.isConnected()) {
      this.transport.emit(event, payload)
      return
    }

    this.pendingCriticalEmits.push({
      event,
      payload,
      expiresAt: Date.now() + (options.ttlMs ?? DEFAULT_CRITICAL_EMIT_TTL_MS),
    })
    while (this.pendingCriticalEmits.length > MAX_PENDING_CRITICAL_EMITS) {
      const dropped = this.pendingCriticalEmits.shift()
      console.warn(
        '[shared-realtime] Pending critical emit dropped (queue full):',
        dropped?.event,
      )
    }
  }

  private flushCriticalEmits(): void {
    if (this.pendingCriticalEmits.length === 0) {
      return
    }

    const now = Date.now()
    const pending = this.pendingCriticalEmits.splice(0, this.pendingCriticalEmits.length)
    pending.forEach((entry) => {
      if (entry.expiresAt <= now) {
        console.warn(
          '[shared-realtime] Pending critical emit expired before reconnect:',
          entry.event,
        )
        return
      }
      this.transport.emit(entry.event, entry.payload)
    })
  }

  /**
   * Registers a room join that must survive reconnects. The emit is replayed on
   * every successful (re)connection until {@link unregisterRejoin} is called, so
   * the socket rejoins the room after any transient drop without the caller
   * having to observe the connection state. Emits immediately when already
   * connected; otherwise the pending connect replays it once connected.
   *
   * Keyed by event name, so repeated registrations for the same room collapse to
   * one — the caller owns the join/leave lifecycle (typically via a ref count).
   */
  registerRejoin(event: string, payload: unknown = {}): void {
    this.rejoinEmits.set(event, payload)
    this.connect()

    if (this.transport.isConnected()) {
      this.transport.emit(event, payload)
    }
  }

  /**
   * Stops replaying a join registered with {@link registerRejoin}. Does not emit
   * a leave — the caller sends its own leave event, since a leave is meaningful
   * only while connected and must not be replayed.
   */
  unregisterRejoin(event: string): void {
    this.rejoinEmits.delete(event)
  }

  private resubscribeAll(): void {
    this.subscriptions.forEach((record) => {
      if (record.count <= 0) {
        return
      }

      this.emitSubscribe(record.channel, record.params)
      record.status = 'active'
    })

    this.emitDiagnosticsChange()
  }

  private replayRejoins(): void {
    this.rejoinEmits.forEach((payload, event) => {
      this.transport.emit(event, payload)
    })
  }

  private markSubscriptionsPending(): void {
    this.subscriptions.forEach((record) => {
      if (record.count > 0) {
        record.status = 'pending'
      }
    })
  }

  private emitSubscribe<Channel extends RealtimeChannelId>(
    channel: Channel,
    params?: RealtimeChannelParamsMap[Channel],
  ): void {
    this.transport.emit(REALTIME_CLIENT_EVENTS.subscribe, {
      channel,
      params,
    } satisfies RealtimeSubscriptionPayload<Channel>)
  }

  private emitDiagnosticsChange(): void {
    const snapshot = this.getDiagnostics()
    this.diagnosticsHandlers.forEach((handler) => {
      try {
        handler(snapshot)
      } catch (error) {
        console.error('[shared-realtime] Client diagnostics handler failed:', error)
      }
    })
  }
}

export const createRealtimeClient = (config: RealtimeClientConfig) => new SharedRealtimeClient(config)
