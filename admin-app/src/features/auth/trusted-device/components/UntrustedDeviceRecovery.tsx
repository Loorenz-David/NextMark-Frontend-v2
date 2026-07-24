import { deviceCredentialStorage } from '../store/deviceCredentialStorage'
import { useDeviceCredential } from '../hooks/useDeviceCredential'

type UntrustedDeviceRecoveryProps = {
  /** Invoked after the credential is dropped, so the caller can reset its error. */
  onCleared: () => void
}

/**
 * Recovery affordance for a browser whose stored trusted-device credential is no
 * longer valid — revoked by an admin, or rotated on another machine.
 *
 * The credential headers ride along on every request, so while it is stored EVERY
 * login from this browser fails with the same 410, regardless of whether the
 * password is correct. Clearing it returns the browser to ordinary single-user
 * login; re-provisioning with the current secret is the other way out and lives
 * in `TrustedDeviceReprovisionPopup`, which is reachable once signed in.
 */
export const UntrustedDeviceRecovery = ({
  onCleared,
}: UntrustedDeviceRecoveryProps) => {
  const credential = useDeviceCredential()

  if (!credential) {
    return null
  }

  const handleClear = () => {
    deviceCredentialStorage.clearCredential()
    onCleared()
  }

  return (
    <button
      type="button"
      onClick={handleClear}
      className="cursor-pointer self-start rounded-lg border border-danger-border px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:border-danger-border hover:bg-danger-bg"
    >
      Clear device credential and sign in normally
    </button>
  )
}
