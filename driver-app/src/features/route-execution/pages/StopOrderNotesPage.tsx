import { CloseIcon } from '@/assets/icons'

type StopOrderNotesPageProps = {
  notes: string[]
  onClose: () => void
}

export function StopOrderNotesPage({ notes, onClose }: StopOrderNotesPageProps) {
  return (
    <section className="flex h-full min-h-[40vh] max-h-full flex-1 flex-col overflow-hidden bg-[rgb(var(--bg-app-color))] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">Order Notes</h2>
          <p className="mt-1 text-sm text-white/60">{notes.length} note{notes.length === 1 ? '' : 's'}</p>
        </div>

        <button
          aria-label="Close order notes"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white"
          onClick={onClose}
          type="button"
        >
          <CloseIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="grid gap-3">
          {notes.map((note, i) => (
            <div
              key={i}
              className="rounded-2xl border border-yellow-400/50 bg-yellow-400/15 px-4 py-3"
            >
              <p className="text-sm font-medium text-yellow-300">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
