import { ApiError } from '@/lib/api/ApiClient'

/**
 * Client-form-config routes use offset statuses (410 validation, 413 forbidden,
 * 414 not found, 510 internal) that carry no meaning to a status-based message
 * map, so the backend's own `error` text is what gets surfaced.
 */
export const readClientFormFailure = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      message: error.payload?.error || error.message || fallback,
    }
  }

  return { status: 500, message: fallback }
}
