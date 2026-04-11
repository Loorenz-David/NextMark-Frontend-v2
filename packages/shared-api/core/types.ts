export interface ApiSuccess<T = unknown> {
  data: T
  warnings: string[]
  status?: number
  message?: string
}

export interface ApiErrorPayload {
  error: string
  code?: string
}

export type ApiEnvelope<T = unknown> = ApiSuccess<T> | ApiErrorPayload
export type ApiResult<T> = ApiSuccess<T>
