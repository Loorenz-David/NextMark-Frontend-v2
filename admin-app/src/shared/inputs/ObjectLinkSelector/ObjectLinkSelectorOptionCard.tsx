import { CloseIcon } from '@/assets/icons'

import type { ObjectLinkSelectorOptionCardProps } from './ObjectLinkSelector.types'

export const ObjectLinkSelectorOptionCard = ({
  item,
  selected = false,
  onSelect,
  onRemove,
}: ObjectLinkSelectorOptionCardProps) => {
  const cardContent = (
    <>
      {item.icon ? <div className="shrink-0 text-[var(--color-muted)]">{item.icon}</div> : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--color-text)]">{item.label}</p>
        {item.details ? (
          <p className="truncate text-xs text-[var(--color-muted)]">{item.details}</p>
        ) : null}
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onRemove(item)
          }}
          className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] p-2 text-[var(--color-muted)] hover:text-[var(--color-text)]"
          aria-label={`Remove ${item.label}`}
        >
          <CloseIcon className="h-3 w-3" />
        </button>
      ) : null}
    </>
  )

  if (!onSelect) {
    return (
      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
          selected
            ? 'border-[rgb(var(--color-light-blue-r),0.28)] bg-[rgb(var(--color-light-blue-r),0.12)]'
            : 'border-white/[0.08] bg-white/[0.04]'
        }`}
      >
        {cardContent}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
        selected
          ? 'border-[rgb(var(--color-light-blue-r),0.28)] bg-[rgb(var(--color-light-blue-r),0.12)]'
          : 'border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07]'
      }`}
      data-popover-close="true"
    >
      {cardContent}
    </button>
  )
}
