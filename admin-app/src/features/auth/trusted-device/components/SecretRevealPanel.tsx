import { useState } from 'react'

type SecretRevealPanelProps = {
  secret: string
  clientId?: string
}

/**
 * Displays a one-time device secret with a copy affordance. The secret is already
 * persisted to this browser by the time it is shown — this panel is a backup for
 * moving the credential to another machine, not the source of truth.
 */
export const SecretRevealPanel = ({ secret, clientId }: SecretRevealPanelProps) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      globalThis.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard may be unavailable; the secret is still selectable in the box.
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-warning-border bg-warning-bg px-3 py-2 text-xs text-warning">
        This secret is shown once and is now stored on this browser. Copy it only if you
        need to move it to another machine — it cannot be retrieved again (rotate to
        replace it).
      </div>

      {clientId ? (
        <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
          Device id
          <div className="rounded-lg border border-border bg-[var(--color-page)] px-3 py-2 font-mono text-xs text-[var(--color-text)] break-all">
            {clientId}
          </div>
        </label>
      ) : null}

      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
        Device secret
        <div className="rounded-lg border border-border bg-[var(--color-page)] px-3 py-2 font-mono text-xs text-[var(--color-text)] break-all">
          {secret}
        </div>
      </label>

      <button
        type="button"
        onClick={() => void copy()}
        className="self-start rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        {copied ? 'Copied' : 'Copy secret'}
      </button>
    </div>
  )
}
