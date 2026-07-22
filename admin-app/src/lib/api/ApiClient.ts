import { ApiError, createApiClient } from '@shared-api'
import { sessionStorage } from '@/features/auth/login/store/sessionStorage'
import { deviceCredentialStorage } from '@/features/auth/trusted-device/store/deviceCredentialStorage'
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
  // Attaches X-Trusted-Device-Id / X-Trusted-Device-Secret on every request
  // (including the unauthenticated login call) once this browser is enrolled.
  // Read live so rotation / un-trust take effect immediately.
  getExtraHeaders: () => deviceCredentialStorage.getHeaders(),
  serializePayload,
  gzipPayload,
  maxCompressedBytes: MAX_COMPRESSED_BYTES,
  maxDecompressedBytes: MAX_DECOMPRESSED_BYTES,
})
