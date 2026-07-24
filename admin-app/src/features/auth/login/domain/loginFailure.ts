/**
 * Classification of a failed `POST /auths/login`.
 *
 * The backend maps every `ValidationFailed` domain error to HTTP 410 — including
 * plain "Incorrect login information." A 410 here is therefore never an expired
 * session and must never trigger a global logout; it is either wrong credentials
 * or a stored device credential this browser can no longer authenticate with.
 */
export type LoginFailureKind = 'credentials' | 'trusted_device_credential'

const TRUSTED_DEVICE_FAILURE_PREFIX = 'trusted-device authentication failed'

/**
 * Shown instead of the generic backend text. The password may well be correct —
 * the device secret was revoked or rotated elsewhere — and until the stored
 * credential is cleared EVERY login from this browser fails, because the
 * `X-Trusted-Device-*` headers ride along on every request.
 */
export const TRUSTED_DEVICE_CREDENTIAL_ERROR =
  'This browser is no longer trusted for the device it was linked to. Clear the stored device credential to sign in normally, or re-provision it with the current device secret.'

export const isTrustedDeviceCredentialFailure = (
  status: number,
  message: string,
): boolean =>
  status === 410 &&
  message.trim().toLowerCase().startsWith(TRUSTED_DEVICE_FAILURE_PREFIX)

export const classifyLoginFailure = (
  status: number,
  message: string,
): LoginFailureKind =>
  isTrustedDeviceCredentialFailure(status, message)
    ? 'trusted_device_credential'
    : 'credentials'
