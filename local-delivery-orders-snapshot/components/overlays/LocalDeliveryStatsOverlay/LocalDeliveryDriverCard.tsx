import { useState } from 'react'

import { ChevronDownIcon } from '@/assets/icons'
import { cn } from '@/lib/utils/cn'
import { MemberAvatar } from '@/shared/layout/MemberAvatar'

import type { LocalDeliveryDriverOverlayStats } from './LocalDeliveryStatsOverlay.types'

type LocalDeliveryDriverCardProps = {
  driver: LocalDeliveryDriverOverlayStats
}

export const LocalDeliveryDriverCard = ({ driver }: LocalDeliveryDriverCardProps) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="pointer-events-none relative">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="pointer-events-auto relative flex min-w-[220px] flex-col rounded-[24px] border border-white/65 bg-white/8 px-4 py-4 text-sm text-white backdrop-blur-md transition-colors hover:bg-white/12"
      >
        <ChevronDownIcon className={cn('absolute right-3 top-3 h-4 w-4 text-white/72 transition-transform', expanded ? '-rotate-90' : 'rotate-0')} />

        <div className="flex items-center gap-3 pr-6">
          <MemberAvatar
            username={driver.initials}
            className="h-12 w-12 shrink-0 bg-white/18 p-0 text-lg text-white"
          />
          <div className="min-w-0 text-left">
            <div className="truncate text-sm font-semibold text-white">{driver.name}</div>
            {driver.registration != null && (
              <div className="mt-1 text-sm font-medium text-white/82">{driver.registration}</div>
            )}
          </div>
        </div>
      </button>

      {expanded ? (
        <div className="pointer-events-auto absolute right-full top-0 mr-3 min-w-[220px] rounded-[24px] border border-white/45 bg-black/28 px-4 py-4 text-left text-xs text-white/72 backdrop-blur-md">
          Driver stats will be added here.
        </div>
      ) : null}
    </div>
  )
}
