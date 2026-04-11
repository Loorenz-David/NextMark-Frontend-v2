import {
  AppleMapsIcon,
  GoogleMapsIcon,
  WazeIcon,
} from '@/assets/icons'
import type { PreferredMapAppId } from '@/app/services/mapAppPreference.service'

type MapAppChooserOptionProps = {
  appId: PreferredMapAppId
  label: string
  onSelect: () => void
}

function MapAppIcon({ appId }: { appId: MapAppChooserOptionProps['appId'] }) {
  const className = 'h-7 w-7 shrink-0 '

  if (appId === 'google-maps') {
    return <GoogleMapsIcon aria-hidden="true" className={className} />
  }

  if (appId === 'apple-maps') {
    return <AppleMapsIcon aria-hidden="true" className={"h-8 w-8 shrink-0"} />
  }

  return (
    <div className="bg-blue-400 rounded-full p-2">
      <WazeIcon aria-hidden="true" className={"h-5 w-5 shrink-0 text-[rgb(var(--bg-strong-light))]"} />
    </div>
  )
}

export function MapAppChooserOption({
  appId,
  label,
  onSelect,
}: MapAppChooserOptionProps) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left text-white transition hover:bg-white/8 active:scale-[0.99]"
      onClick={onSelect}
      type="button"
    >
      <MapAppIcon appId={appId} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
