import { BoldCheckIcon } from '@/assets/icons'
import type { StopDetailTerminalStatusDisplay } from '../../domain/stopDetailDisplay.types'

type StopDetailTerminalStatusProps = {
  status: StopDetailTerminalStatusDisplay
}

export function StopDetailTerminalStatus({
  status,
}: StopDetailTerminalStatusProps) {
  return (
    <div className="rounded-2xl border border-white/14 bg-white/6 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(0,232,255,0.16)] text-cyan-300">
            <BoldCheckIcon aria-hidden="true" className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">{status.label}</p>
          </div>
        </div>

        <button
          className="shrink-0 rounded-full border border-white/18 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white"
          onClick={status.onUndo}
          type="button"
        >
          Undo
        </button>
      </div>
    </div>
  )
}
