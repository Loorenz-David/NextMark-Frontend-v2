import { ApiError, createApiClient } from '@shared-api'
import { sessionStorage } from '@/features/auth/login/store/sessionStorage'
import {
  gzipPayload,
  MAX_COMPRESSED_BYTES,
  MAX_DECOMPRESSED_BYTES,
  serializePayload,
} from './compression'

export { ApiError }

export const apiClient = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api_v2',
  refreshPath: '/auths/refresh_token',
  sessionAccessor: sessionStorage,
  serializePayload,
  gzipPayload,
  maxCompressedBytes: MAX_COMPRESSED_BYTES,
  maxDecompressedBytes: MAX_DECOMPRESSED_BYTES,
})
