import type { ApiErrorPayload } from './types'

export class ApiError extends Error {
  public readonly status: number
  public readonly payload?: ApiErrorPayload

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}
