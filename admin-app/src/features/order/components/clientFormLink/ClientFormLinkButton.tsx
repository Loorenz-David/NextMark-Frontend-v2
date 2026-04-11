import type { Phone } from '@/types/phone'
import { useOrderDetailActions } from '../../actions/orderDetails.actions'

type Props = {
  orderId: number
  clientId?: string | null
  hasGeneratedLink?: boolean
  initialEmail?: string | null
  initialPhone?: Phone | null
}

export const ClientFormLinkButton = ({
  orderId,
  clientId,
  hasGeneratedLink = false,
  initialEmail,
  initialPhone,
}: Props) => {
  const { handleClientFormLinkButtonClick } = useOrderDetailActions()

  const handleClick = () => {
    void handleClientFormLinkButtonClick({
      orderId,
      clientId,
      hasGeneratedLink,
      initialEmail,
      initialPhone,
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-sm font-medium text-[var(--color-text)] shadow-[0_10px_24px_rgba(0,0,0,0.14)] transition-colors hover:bg-white/[0.09]"
    >
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
      {hasGeneratedLink ? 'Regenerate client form link' : 'Send client form link'}
    </button>
  )
}
