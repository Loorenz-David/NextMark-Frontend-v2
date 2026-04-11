import { useState } from 'react'
import type { DriverStopRowNoteDisplay } from '../../domain/mapStopRowOrderNote'
import type { StopDetailInfoRowDisplay } from '../../domain/stopDetailDisplay.types'
import { StopDetailInfoRow } from './StopDetailInfoRow'

type StopDetailBodyProps = {
  rows: StopDetailInfoRowDisplay[]
  orderNotes: DriverStopRowNoteDisplay[]
}

function StopDetailOrderNote({ note }: { note: DriverStopRowNoteDisplay }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldAllowExpansion = note.content.length > 120

  return (
    <button
      className={`w-full rounded-[20px] border px-4 py-3 text-left ${note.containerClassName}`}
      onClick={() => {
        if (!shouldAllowExpansion) {
          return
        }
        setIsExpanded((current) => !current)
      }}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`min-w-0 text-sm leading-6 ${note.contentClassName} ${isExpanded ? '' : 'line-clamp-2'}`}>
          {note.content}
        </p>
        {shouldAllowExpansion ? (
          <svg
            aria-hidden="true"
            className={`mt-1 h-5 w-5 shrink-0 stroke-[2.5] ${note.labelClassName} ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
      <p className="sr-only">
        {shouldAllowExpansion
          ? (isExpanded ? 'Tap to collapse note' : 'Tap to expand note')
          : 'Order note'}
      </p>
    </button>
  )
}

export function StopDetailBody({ rows, orderNotes }: StopDetailBodyProps) {
  return (
    <section className="space-y-3 px-5 pb-6 pt-2">
      {orderNotes.map((note) => (
        <StopDetailOrderNote key={note.id} note={note} />
      ))}
      {rows.map((row) => (
        <StopDetailInfoRow
          key={row.id}
          row={row}
        />
      ))}
    </section>
  )
}
