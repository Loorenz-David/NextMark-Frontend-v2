import { formatIsoDateFriendly, formatIsoTime } from '@/shared/utils/formatIsoDate'

type Props = {
  /** ISO timestamp set by the server when the client submits the form. */
  clientFormSubmittedAt: string | null | undefined
  /**
   * Presence of a hash indicates a link has been generated.
   * Used to distinguish "no link yet" from "link sent, awaiting submission".
   */
  tokenHash: string | null | undefined
}

/**
 * Badge showing the current client form status on the order detail.
 *
 * Render rules:
 *   - submittedAt is set           → green "Client info received" + date
 *   - tokenHash set, no submittedAt → yellow "Awaiting client"
 *   - neither                      → renders nothing
 */
export const ClientFormLinkStatus = ({ clientFormSubmittedAt, tokenHash }: Props) => {
  if (clientFormSubmittedAt) {
    const date = formatIsoDateFriendly(clientFormSubmittedAt)
    const time = formatIsoTime(clientFormSubmittedAt)
    const label = [date, time].filter(Boolean).join(' at ')

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/[0.12] px-2.5 py-1 text-xs font-medium text-emerald-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Client info received{label ? ` · ${label}` : ''}
      </span>
    )
  }

  if (tokenHash) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-400/[0.12] px-2.5 py-1 text-xs font-medium text-amber-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Awaiting client
      </span>
    )
  }

  return null
}
