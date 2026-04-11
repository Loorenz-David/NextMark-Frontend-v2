import { ApiError } from '../core/ApiError'
import type { ApiEnvelope, ApiErrorPayload, ApiResult } from '../core/types'
import type { ApiClientConfig, RequestOptions, SessionIdentity, SessionSnapshot, SessionUser } from './types'

const defaultSerializePayload = (payload: unknown) => {
  const json = JSON.stringify(payload)
  const bytes = new TextEncoder().encode(json)

  return { json, bytes }
}

export class HttpApiClient {
  private readonly baseUrl: string
  private readonly refreshPath: string
  private readonly fetchImpl: typeof fetch
  private refreshPromise: Promise<boolean> | null = null
  private options: ApiClientConfig

  constructor(options: ApiClientConfig) {
    this.options = options
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    this.refreshPath = options.refreshPath
    this.fetchImpl = options.fetchImpl ?? fetch.bind(globalThis)
  }

  setUnauthenticatedHandler(handler?: () => void): void {
    this.options.onUnauthenticated = handler
  }

  getAccessToken(): string | null {
    return this.options.sessionAccessor.getSession()?.accessToken ?? null
  }

  getRefreshToken(): string | null {
    return this.options.sessionAccessor.getSession()?.refreshToken ?? null
  }

  getSocketToken(): string | null {
    return this.options.sessionAccessor.getSession()?.socketToken ?? null
  }

  getSessionUserId(): string | number | null {
    const session = this.options.sessionAccessor.getSession()
    return session?.user?.id ?? null
  }

  getSessionUser(): SessionUser | null {
    const session = this.options.sessionAccessor.getSession()
    return session?.user ?? null
  }

  getSessionIdentity(): SessionIdentity | null {
    const session = this.options.sessionAccessor.getSession()
    return session?.identity ?? null
  }

  getSessionTimeZone(): string | null {
    const timeZone = this.getSessionIdentity()?.time_zone
    return typeof timeZone === 'string' && timeZone.trim() ? timeZone.trim() : null
  }

  getSessionCountryCode(): string | null {
    const identityDefaultCountryCode = this.getSessionIdentity()?.default_country_code
    if (typeof identityDefaultCountryCode === 'string' && identityDefaultCountryCode.trim()) {
      return identityDefaultCountryCode.trim()
    }

    const identityCountryCode = this.getSessionIdentity()?.country_code
    if (typeof identityCountryCode === 'string' && identityCountryCode.trim()) {
      return identityCountryCode.trim()
    }

    const userDefaultCountryCode = this.getSessionUser()?.default_country_code
    if (typeof userDefaultCountryCode === 'string' && userDefaultCountryCode.trim()) {
      return userDefaultCountryCode.trim()
    }

    const userCountryCode = this.getSessionUser()?.country_code
    return typeof userCountryCode === 'string' && userCountryCode.trim()
      ? userCountryCode.trim()
      : null
  }

  getSessionCity(): string | null {
    const identityDefaultCityKey = this.getSessionIdentity()?.default_city_key
    if (typeof identityDefaultCityKey === 'string' && identityDefaultCityKey.trim()) {
      return identityDefaultCityKey.trim()
    }

    const identityCity = this.getSessionIdentity()?.city
    if (typeof identityCity === 'string' && identityCity.trim()) {
      return identityCity.trim()
    }

    const userDefaultCityKey = this.getSessionUser()?.default_city_key
    if (typeof userDefaultCityKey === 'string' && userDefaultCityKey.trim()) {
      return userDefaultCityKey.trim()
    }

    const userCity = this.getSessionUser()?.city
    return typeof userCity === 'string' && userCity.trim()
      ? userCity.trim()
      : null
  }

  async request<T>(options: RequestOptions, attempt = 0): Promise<ApiResult<T>> {
    const {
      path,
      method = 'GET',
      data,
      compress = false,
      headers = {},
      signal,
      requiresAuth = true,
      query,
    } = options

    const url = this.composeUrl(path, query)
    const session = this.options.sessionAccessor.getSession()
    const finalHeaders: Record<string, string> = { ...headers }

    if (requiresAuth && session?.accessToken) {
      finalHeaders.Authorization = `Bearer ${session.accessToken}`
    }

    let body: BodyInit | undefined
    if (data !== undefined) {
      const built = this.buildRequestBody(data, compress)
      body = built.body
      Object.assign(finalHeaders, built.headers)
    }

    const response = await this.fetchImpl(url, {
      method,
      headers: finalHeaders,
      body,
      signal,
      cache: requiresAuth ? 'no-store' : 'default',
    })

    const rawText = await response.text()
    const envelope = rawText ? this.parseEnvelope<ApiEnvelope<unknown>>(rawText) : undefined
    if (rawText && !envelope) {
      throw new ApiError('Invalid response from server', response.status)
    }

    if (requiresAuth && this.isAuthError(response.status, envelope)) {
      if (attempt === 0 && (await this.tryRefresh())) {
        return this.request(options, attempt + 1)
      }

      this.handleUnauthenticated()
      const errorPayload = this.asErrorPayload(envelope)
      throw new ApiError(errorPayload?.error || 'Unauthorized', response.status, errorPayload)
    }

    if (!response.ok) {
      const errorPayload = this.asErrorPayload(envelope)
      throw new ApiError(
        errorPayload?.error || response.statusText || 'Request failed',
        response.status,
        errorPayload,
      )
    }

    if (!envelope) {
      return {
        data: null as T,
        warnings: [],
        status: response.status,
      }
    }

    if (!('data' in envelope)) {
      throw new ApiError('Invalid response from server', response.status)
    }

    const success = envelope as { data: T; warnings?: string[] }
    return {
      data: success.data,
      warnings: success.warnings ?? [],
      status: response.status,
    }
  }

  async refreshTokens(): Promise<boolean> {
    return this.tryRefresh()
  }

  replaceTokens(
    nextAccessToken: string,
    nextRefreshToken: string,
    nextSocketToken?: string,
    nextUser?: SessionUser | null,
  ): void {
    const existing = this.options.sessionAccessor.getSession()
    const base: Partial<SessionSnapshot> = existing ?? {}
    this.options.sessionAccessor.setSession(this.normalizeSession({
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      socketToken: nextSocketToken ?? base.socketToken,
      user: nextUser ?? base.user ?? null,
      identity: base.identity ?? null,
    }))
  }

  setSession(session: Omit<SessionSnapshot, 'updatedAt'>): void {
    this.options.sessionAccessor.setSession(this.normalizeSession(session))
  }

  clearSession(): void {
    this.options.sessionAccessor.clear()
  }

  private buildRequestBody(
    data: unknown,
    compress: boolean,
  ): { body: BodyInit; headers: Record<string, string> } {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return { body: data, headers: {} }
    }

    const serializePayload = this.options.serializePayload ?? defaultSerializePayload
    const { json, bytes } = serializePayload(data)
    const maxDecompressedBytes = this.options.maxDecompressedBytes ?? Infinity
    if (bytes.byteLength > maxDecompressedBytes) {
      throw new ApiError('Payload too large', 413)
    }

    if (!compress) {
      return {
        body: json,
        headers: { 'Content-Type': 'application/json' },
      }
    }

    if (!this.options.gzipPayload) {
      throw new ApiError('Compressed requests are not configured', 500)
    }

    const compressed = this.options.gzipPayload(bytes)
    const maxCompressedBytes = this.options.maxCompressedBytes ?? Infinity
    if (compressed.byteLength > maxCompressedBytes) {
      throw new ApiError('Compressed payload too large', 413)
    }

    return {
      body: new Uint8Array(compressed).buffer,
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    }
  }

  private parseEnvelope<T>(rawText: string): T | undefined {
    try {
      return JSON.parse(rawText) as T
    } catch (error) {
      console.warn('Failed to parse API response', error)
      return undefined
    }
  }

  private isAuthError(status: number, envelope?: ApiEnvelope<unknown>): boolean {
    if (status === 413) {
      return true
    }

    const errorPayload = this.asErrorPayload(envelope)
    if (!errorPayload?.error) {
      return false
    }

    const message = errorPayload.error.toLowerCase()
    return message.includes('token') || message.includes('authorization')
  }

  private asErrorPayload(envelope?: ApiEnvelope<unknown>): ApiErrorPayload | undefined {
    if (!envelope || typeof envelope !== 'object') {
      return undefined
    }

    if ('error' in envelope) {
      const error = (envelope as { error?: unknown }).error
      if (typeof error === 'string') {
        const code = 'code' in envelope ? (envelope as { code?: string }).code : undefined
        return { error, code }
      }
    }

    return undefined
  }

  private composeUrl(path: string, query?: RequestOptions['query']): string {
    const trimmedPath = path.startsWith('http')
      ? path
      : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`

    if (!query) {
      return trimmedPath
    }

    const parts: string[] = []

    const appendQueryValue = (key: string, value: unknown): void => {
      if (value === undefined || value === null) {
        return
      }

      if (Array.isArray(value)) {
        value.forEach((item) => appendQueryValue(`${key}[]`, item))
        return
      }

      if (typeof value === 'object') {
        Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
          appendQueryValue(`${key}[${nestedKey}]`, nestedValue)
        })
        return
      }

      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    }

    Object.entries(query).forEach(([key, value]) => {
      appendQueryValue(key, value)
    })

    const queryString = parts.join('&')

    return queryString ? `${trimmedPath}?${queryString}` : trimmedPath
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const existing = this.options.sessionAccessor.getSession()
    if (!existing?.refreshToken) {
      return false
    }

    const { refreshToken } = existing
    this.refreshPromise = (async () => {
      const response = await this.fetchImpl(this.composeUrl(this.refreshPath), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Refresh token rejected')
      }

      const rawText = await response.text()
      if (!rawText) {
        throw new Error('Empty refresh response')
      }

      const envelope = this.parseEnvelope<ApiEnvelope<Record<string, string>>>(rawText)
      if (!envelope || !('data' in envelope)) {
        throw new Error('Invalid refresh response')
      }

      const data = envelope.data
      const nextAccess = data?.access_token
      const nextSocket = data?.socket_token

      if (!nextAccess) {
        throw new Error('Refresh response missing access token')
      }

      this.options.sessionAccessor.setSession(this.normalizeSession({
        ...existing,
        accessToken: nextAccess,
        socketToken: nextSocket ?? existing.socketToken,
      }))
      return true
    })()
      .catch((error) => {
        console.warn('Token refresh failed', error)
        this.handleUnauthenticated()
        return false
      })
      .finally(() => {
        this.refreshPromise = null
      })

    return this.refreshPromise
  }

  private handleUnauthenticated(): void {
    this.options.onUnauthenticated?.()
  }

  private normalizeSession(session: Omit<SessionSnapshot, 'updatedAt'>): Omit<SessionSnapshot, 'updatedAt'> {
    const tokenIdentity = decodeJwtIdentity(session.accessToken)
    const mergedIdentity = tokenIdentity ?? session.identity ?? null
    return {
      ...session,
      identity: mergedIdentity,
      user: this.mergeSessionUser(session.user ?? null, mergedIdentity),
    }
  }

  private mergeSessionUser(
    user: SessionUser | null | undefined,
    identity: SessionIdentity | null,
  ): SessionUser | null {
    if (!user && !identity) {
      return null
    }

    const nextUser: SessionUser = { ...(user ?? {}) }
    const teamId = identity?.active_team_id ?? identity?.team_id
    if (teamId !== undefined) {
      nextUser.teamId = teamId
      nextUser.active_team_id = teamId
    }
    const userRoleId = identity?.user_role_id
    if (typeof userRoleId === 'number') {
      nextUser.user_role_id = userRoleId
    }
    const baseRoleId = identity?.base_role_id
    if (typeof baseRoleId === 'number') {
      nextUser.base_role_id = baseRoleId
    }
    const baseRole = identity?.base_role
    if (typeof baseRole === 'string') {
      nextUser.base_role = baseRole
    }
    const appScope = identity?.app_scope
    if (typeof appScope === 'string') {
      nextUser.app_scope = appScope
    }
    const sessionScopeId = identity?.session_scope_id
    if (typeof sessionScopeId === 'string') {
      nextUser.session_scope_id = sessionScopeId
    }
    const currentWorkspace = identity?.current_workspace
    if (typeof currentWorkspace === 'string') {
      nextUser.current_workspace = currentWorkspace
    }
    const defaultCountryCode = identity?.default_country_code
    if (typeof defaultCountryCode === 'string') {
      nextUser.default_country_code = defaultCountryCode
    }
    const defaultCityKey = identity?.default_city_key
    if (typeof defaultCityKey === 'string') {
      nextUser.default_city_key = defaultCityKey
    }
    const countryCode = identity?.country_code
    if (typeof countryCode === 'string') {
      nextUser.country_code = countryCode
    }
    const city = identity?.city
    if (typeof city === 'string') {
      nextUser.city = city
    }
    const hasTeamWorkspace = identity?.has_team_workspace
    if (typeof hasTeamWorkspace === 'boolean') {
      nextUser.has_team_workspace = hasTeamWorkspace
    }
    return nextUser
  }
}

const decodeJwtIdentity = (token: string | null | undefined): SessionIdentity | null => {
  if (!token) {
    return null
  }

  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  try {
    const payload = decodeBase64Url(parts[1] ?? '')
    const parsed = JSON.parse(payload) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') {
      return null
    }
    return parsed as SessionIdentity
  } catch (error) {
    console.warn('Failed to decode access token identity', error)
    return null
  }
}

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')

  if (typeof globalThis.atob === 'function') {
    const decoded = globalThis.atob(padded)
    return decodeURIComponent(
      Array.from(decoded)
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
  }

  throw new Error('Base64 decoder unavailable')
}

export const createApiClient = (options: ApiClientConfig) => new HttpApiClient(options)
