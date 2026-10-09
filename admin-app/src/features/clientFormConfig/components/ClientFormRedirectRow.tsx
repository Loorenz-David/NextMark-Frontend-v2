import { resolveClientFormRedirect } from '@client-form-kit'

import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'

import type { ClientFormRedirect } from '../types/clientFormRedirect'

type ClientFormRedirectRowProps = {
  /** `null` renders the "no redirect" choice. */
  redirect: ClientFormRedirect | null
  isActive: boolean
  onActivate: (redirect: ClientFormRedirect | null) => void
  onEdit?: (clientId: string) => void
  onDelete?: (redirect: ClientFormRedirect) => void
}

export const ClientFormRedirectRow = ({
  redirect,
  isActive,
  onActivate,
  onEdit,
  onDelete,
}: ClientFormRedirectRowProps) => {
  // The same check the public form runs before navigating: a row that fails it
  // would silently never redirect, so it is flagged here instead.
  const resolved = redirect ? resolveClientFormRedirect(redirect.url) : null
  const isUnusable = redirect !== null && resolved === null

  return (
    <div
      className={`flex w-full items-center gap-4 rounded-3xl border px-5 py-4 transition-colors ${
        isActive
          ? 'border-[rgb(var(--color-light-blue-r),0.45)] bg-[rgb(var(--color-light-blue-r),0.08)]'
          : 'border-border bg-surface-raised'
      }`}
    >
      <button
        type="button"
        role="radio"
        aria-checked={isActive}
        aria-label={redirect ? `Redirect to ${redirect.label}` : 'No redirect'}
        onClick={() => onActivate(redirect)}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            isActive ? 'border-[rgb(var(--color-light-blue-r))]' : 'border-border'
          }`}
        >
          {isActive ? (
            <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--color-light-blue-r))]" />
          ) : null}
        </span>

        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-[var(--color-text)]">
            {redirect ? redirect.label : 'No redirect'}
          </span>
          <span className="truncate text-xs text-[var(--color-muted)]">
            {redirect
              ? redirect.url
              : 'Customers stay on the confirmation screen after submitting.'}
          </span>
          {isUnusable ? (
            <span className="text-xs text-danger">
              This address is not a valid https link and will be ignored.
            </span>
          ) : null}
        </span>
      </button>

      {redirect ? (
        <div className="flex shrink-0 items-center gap-2">
          {resolved ? (
            <a
              href={resolved.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              Open
            </a>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(redirect.client_id)}
              className="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              Edit
            </button>
          ) : null}
          {onDelete ? (
            <ConfirmActionButton
              onConfirm={() => onDelete(redirect)}
              deleteContent="Delete"
              confirmContent="Confirm"
              deleteClassName="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-danger hover:text-danger"
              confirmClassName="rounded-full px-3 py-1 text-xs text-text"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
