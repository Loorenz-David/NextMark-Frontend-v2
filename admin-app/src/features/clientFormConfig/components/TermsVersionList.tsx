import { formatDateOnlyInTimeZone, formatIsoTime } from '@/shared/utils/formatIsoDate'

import { termsDocumentToPlainText } from '../domain/termsDocument'
import type { ClientFormTermsVersion } from '../types/clientFormTerms'

type TermsVersionListProps = {
  versions: ClientFormTermsVersion[]
  isLoading: boolean
  /** The version the current draft was seeded from, if any. */
  sourceVersionId: number | null
  onLoadVersion: (version: ClientFormTermsVersion) => void
}

const formatCreatedAt = (value: string) => {
  const date = formatDateOnlyInTimeZone(value)
  const time = formatIsoTime(value)
  if (!date) {
    return 'Unknown date'
  }
  return time ? `${date} · ${time}` : date
}

export const TermsVersionList = ({
  versions,
  isLoading,
  sourceVersionId,
  onLoadVersion,
}: TermsVersionListProps) => {
  if (isLoading) {
    return <p className="text-xs text-[var(--color-muted)]">Loading version history…</p>
  }

  if (!versions.length) {
    return (
      <p className="text-xs text-[var(--color-muted)]/70">
        No versions published yet. The first publish becomes version 1.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {versions.map((version) => {
        const preview = termsDocumentToPlainText(version.content).trim()
        const isSource = version.id === sourceVersionId

        return (
          <div
            key={version.client_id}
            className={`flex flex-col gap-2 rounded-3xl border px-4 py-3 ${
              isSource
                ? 'border-[rgb(var(--color-light-blue-r),0.35)] bg-[rgb(var(--color-light-blue-r),0.08)]'
                : 'border-border bg-surface-raised'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  Version {version.version_number}
                </p>
                {version.is_active ? (
                  <span className="rounded-full border border-success-border bg-success-bg px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-success">
                    Live
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onLoadVersion(version)}
                className="shrink-0 rounded-full border border-border bg-surface-raised px-3 py-1 text-[0.65rem] text-[var(--color-muted)] hover:text-[var(--color-text)]"
              >
                Load into editor
              </button>
            </div>
            <p className="text-[0.65rem] text-[var(--color-muted)]/70">
              {formatCreatedAt(version.created_at)}
            </p>
            {preview ? (
              <p className="line-clamp-2 text-xs leading-5 text-[var(--color-muted)]">{preview}</p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
