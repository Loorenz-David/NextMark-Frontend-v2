import { useState } from 'react'
import { generateClientFormLink } from './clientFormLink.api'
import { ClientFormLinkModal } from './ClientFormLinkModal'

type Props = {
  orderId: number
}

type ModalData = {
  formUrl: string
  expiresAt: string
}

/**
 * Button that calls POST /orders/:orderId/client-form-link and opens
 * ClientFormLinkModal with the returned URL on success.
 *
 * Handles loading state, error display, and regeneration (re-uses the same
 * API call so the modal stays open and updates in place).
 */
export const ClientFormLinkButton = ({ orderId }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalData, setModalData] = useState<ModalData | null>(null)

  const callApi = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await generateClientFormLink(orderId)
      setModalData({ formUrl: result.form_url, expiresAt: result.expires_at })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={callApi}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-sm font-medium text-[var(--color-text)] shadow-[0_10px_24px_rgba(0,0,0,0.14)] transition-colors hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-muted)] border-t-transparent" />
            Generating…
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Send client form link
          </>
        )}
      </button>

      {error && (
        <p className="mt-1 text-xs text-rose-300">{error}</p>
      )}

      {modalData && (
        <ClientFormLinkModal
          formUrl={modalData.formUrl}
          expiresAt={modalData.expiresAt}
          onClose={() => setModalData(null)}
          onRegenerate={callApi}
          isRegenerating={isLoading}
        />
      )}
    </>
  )
}
