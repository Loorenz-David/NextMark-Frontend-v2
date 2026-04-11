import { MapAppChooserOption } from './MapAppChooserOption'
import type { PreferredMapAppId } from '@/app/services/mapAppPreference.service'

type MapAppChooserListProps = {
  onSelectApp: (appId: PreferredMapAppId) => void
}

const APP_OPTIONS = [
  { id: 'google-maps', label: 'Google Maps' },
  { id: 'apple-maps', label: 'Apple Maps' },
  { id: 'waze', label: 'Waze' },
] as const

export function MapAppChooserList({ onSelectApp }: MapAppChooserListProps) {
  return (
    <div className="flex flex-col gap-3">
      {APP_OPTIONS.map((option) => (
        <MapAppChooserOption
          appId={option.id}
          key={option.id}
          label={option.label}
          onSelect={() => onSelectApp(option.id)}
        />
      ))}
    </div>
  )
}
