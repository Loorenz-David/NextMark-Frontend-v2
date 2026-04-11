import type { availableChannels } from '../types'

type ChannelTabsProps = {
  channels: availableChannels[]
  activeChannel?: availableChannels
  onSelectChannel: (channel: availableChannels) => void
}

export const ChannelTabs = ({
  channels,
  activeChannel,
  onSelectChannel,
}: ChannelTabsProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      {channels.map((channel) => {
        const isActive = channel === activeChannel
        return (
          <button
            key={channel}
            type="button"
            onClick={() => onSelectChannel(channel)}
            className={`rounded-2xl px-4 py-2 text-xs font-semibold transition-colors ${
              isActive 
                ? 'border border-[rgb(var(--color-light-blue-r),0.35)] bg-[rgb(var(--color-light-blue-r),0.14)] text-[rgb(var(--color-light-blue-r))]'
                : 'border border-white/[0.05] bg-white/[0.04] text-[var(--color-text)]'
            }`}
          >
            {channel}
          </button>
        )
      })}
    </div>
  )
}
