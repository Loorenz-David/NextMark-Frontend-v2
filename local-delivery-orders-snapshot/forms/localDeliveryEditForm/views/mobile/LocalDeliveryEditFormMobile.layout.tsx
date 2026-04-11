import { LocalDeliveryEditFormForm } from '../../components'
import type { LocalDeliveryEditFormViewProps } from '../LocalDeliveryEditForm.views.types'

export const LocalDeliveryEditFormMobileLayout = ({
  header,
  onClose,
}: LocalDeliveryEditFormViewProps) => {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[var(--color-page)]">
      <div className="flex items-start justify-between border-b border-[var(--color-border)] px-4 py-4">
        <div className="min-w-0 pr-3">
          <div className="text-base font-semibold text-[var(--color-text)]">{header.title}</div>
          {header.subtitle ? (
            <div className="mt-1 text-xs text-[var(--color-muted)]">{header.subtitle}</div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close local delivery edit form"
          className="rounded-md px-2 py-1 text-xs text-[var(--color-muted)] transition-colors hover:bg-[var(--color-muted)]/10"
        >
          Close
        </button>
      </div>

      <div className="h-full min-h-0">
        <LocalDeliveryEditFormForm />
      </div>
    </div>
  )
}
