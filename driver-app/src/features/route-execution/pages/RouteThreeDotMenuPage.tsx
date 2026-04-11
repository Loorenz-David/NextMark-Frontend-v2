import { CloseIcon } from '@/assets/icons'
import { ThreeDotMenuPanel } from '../components/ThreeDotMenu'

type RouteThreeDotMenuPageProps = {
  onClose: () => void
}

export function RouteThreeDotMenuPage({
  onClose,
}: RouteThreeDotMenuPageProps) {
  return (
    <section className="flex min-h-[20vh] flex-col bg-[rgb(var(--bg-app-color))] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">More options</h2>
          <p className="mt-1 text-sm text-white/60">Route actions and tools.</p>
        </div>

        <button
          aria-label="Close route options"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white"
          onClick={onClose}
          type="button"
        >
          <CloseIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      <ThreeDotMenuPanel />
    </section>
  )
}
