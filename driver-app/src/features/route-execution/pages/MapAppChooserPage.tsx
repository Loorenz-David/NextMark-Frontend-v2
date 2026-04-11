import { CloseIcon } from '@/assets/icons'
import type { MapNavigationDestination } from '@/app/services/mapNavigation.service'
import { useMapAppChooserController } from '../controllers/useMapAppChooser.controller'
import {
  MapAppChooserList,
  MapAppPreferenceCheckbox,
} from '../components/navigate-chooser'

type MapAppChooserPageProps = {
  destination: MapNavigationDestination
  onClose: () => void
}

export function MapAppChooserPage({
  destination,
  onClose,
}: MapAppChooserPageProps) {
  const controller = useMapAppChooserController({
    destination,
    onClose,
  })

  return (
    <section className="flex min-h-[20vh] flex-col bg-[rgb(var(--bg-app-color))] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">Open in maps</h2>
          <p className="mt-1 text-sm text-white/60">{controller.destination.label}</p>
        </div>

        <button
          aria-label="Close map app chooser"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white"
          onClick={onClose}
          type="button"
        >
          <CloseIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      <div
        className="flex flex-1 flex-col gap-4 px-5 py-5"
        data-bottom-sheet-gesture-lock="true"
      >
        <MapAppChooserList onSelectApp={controller.selectMapApp} />
        <MapAppPreferenceCheckbox
          checked={controller.persistPreference}
          onChange={controller.setPersistPreference}
        />
      </div>
    </section>
  )
}
