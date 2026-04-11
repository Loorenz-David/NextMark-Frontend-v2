import type { LocalDeliveryRouteGroupItem } from './types'

type LocalDeliveryRouteGroupAvatarProps = {
  item: LocalDeliveryRouteGroupItem
  onClick: (item: LocalDeliveryRouteGroupItem) => void
}

export const LocalDeliveryRouteGroupAvatar = ({
  item,
  onClick,
}: LocalDeliveryRouteGroupAvatarProps) => {
  return (
    <button
      type="button"
      className="flex w-full flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-light-blue-r),0.55)]"
      onClick={() => onClick(item)}
    >
      <span
        aria-hidden="true"
        className="block h-12 w-12 rounded-full border border-[rgb(var(--color-light-blue-r),0.22)] bg-[rgba(172,228,244,0.12)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_22px_rgba(29,74,102,0.14)]"
      />
      <span className="line-clamp-2 text-xs font-medium leading-4 text-[var(--color-text)]/80">
        {item.label}
      </span>
    </button>
  )
}
