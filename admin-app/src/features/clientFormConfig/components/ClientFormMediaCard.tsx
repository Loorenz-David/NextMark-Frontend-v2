import type { ReactNode } from 'react'

import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'
import { Switch } from '@/shared/inputs/Switch'

import type { ClientFormMedia } from '../types/clientFormMedia'

type ClientFormMediaCardProps = {
  media: ClientFormMedia
  onEdit: (clientId: string) => void
  onToggleEnabled: (media: ClientFormMedia, enabled: boolean) => void
  onDelete: (media: ClientFormMedia) => void
  dragHandle?: ReactNode
}

export const ClientFormMediaCard = ({
  media,
  onEdit,
  onToggleEnabled,
  onDelete,
  dragHandle,
}: ClientFormMediaCardProps) => (
  <div
    className={`flex w-full items-start gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.04] px-5 py-4 ${
      media.enabled ? '' : 'opacity-60'
    }`}
  >
    {dragHandle}

    <img
      src={media.url}
      alt={media.alt_text ?? ''}
      className="h-16 w-24 shrink-0 rounded-[14px] border border-white/[0.08] object-cover"
    />

    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <p className="truncate text-sm font-semibold text-[var(--color-text)]">
        {media.title ?? 'Untitled image'}
      </p>
      {media.description ? (
        <p className="line-clamp-2 text-xs leading-5 text-[var(--color-muted)]">
          {media.description}
        </p>
      ) : null}
      <p className="truncate text-[0.65rem] text-[var(--color-muted)]/70">{media.url}</p>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {media.link_url ? (
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            Links out
          </span>
        ) : null}
        {media.alt_text ? null : (
          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-amber-300/80">
            No alt text
          </span>
        )}
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-2">
      <Switch
        value={media.enabled}
        onChange={(value) => onToggleEnabled(media, value)}
        ariaLabel={`Show this image on the form`}
        sizeClassName="h-7 w-12"
      />
      <button
        type="button"
        onClick={() => onEdit(media.client_id)}
        className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        Edit
      </button>
      <ConfirmActionButton
        onConfirm={() => onDelete(media)}
        deleteContent="Delete"
        confirmContent="Confirm"
        deleteClassName="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-red-400 hover:text-red-300"
        confirmClassName="rounded-full px-3 py-1 text-xs text-white"
      />
    </div>
  </div>
)
