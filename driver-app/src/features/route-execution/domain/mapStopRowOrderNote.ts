import type { Order } from '@shared-domain'

export type DriverStopRowNoteType = 'COSTUMER' | 'GENERAL'

export type DriverStopRowNoteDisplay = {
  id: string
  type: DriverStopRowNoteType
  label: string
  content: string
  containerClassName: string
  labelClassName: string
  contentClassName: string
}

const STOP_ROW_NOTE_PRIORITY: Record<DriverStopRowNoteType, number> = {
  COSTUMER: 0,
  GENERAL: 1,
}

const STOP_ROW_NOTE_STYLES: Record<
  DriverStopRowNoteType,
  Pick<DriverStopRowNoteDisplay, 'label' | 'containerClassName' | 'labelClassName' | 'contentClassName'>
> = {
  COSTUMER: {
    label: 'Costumer Note',
    containerClassName:
      'border-amber-300/25 bg-[linear-gradient(135deg,rgba(255,201,71,0.14),rgba(255,201,71,0.04))]',
    labelClassName: 'text-amber-200/75',
    contentClassName: 'text-amber-50/95',
  },
  GENERAL: {
    label: 'Admin Note',
    containerClassName:
      'border-cyan-300/25 bg-[linear-gradient(135deg,rgba(56,189,248,0.15),rgba(56,189,248,0.05))]',
    labelClassName: 'text-cyan-200/80',
    contentClassName: 'text-cyan-50/95',
  },
}

function normalizeStopRowNoteType(value: unknown): DriverStopRowNoteType | null {
  const normalized = String(value ?? '').toUpperCase()
  if (normalized === 'COSTUMER') {
    return 'COSTUMER'
  }
  if (normalized === 'GENERAL' || normalized.length === 0) {
    return 'GENERAL'
  }
  return null
}

export function mapStopOrderNotes(
  notes: Order['order_notes'] | unknown,
): DriverStopRowNoteDisplay[] {
  const noteEntries = Array.isArray(notes)
    ? notes
    : notes != null
      ? [notes]
      : []

  const candidates = noteEntries
    .map((note, index) => {
      if (typeof note === 'string') {
        const content = note.trim()
        if (!content) {
          return null
        }

        return {
          id: `legacy-${index}`,
          type: 'GENERAL' as DriverStopRowNoteType,
          content,
        }
      }

      if (!note || typeof note !== 'object') {
        return null
      }

      const typedNote = note as { type?: unknown; content?: unknown }
      const type = normalizeStopRowNoteType(typedNote.type)
      const content = typeof typedNote.content === 'string' ? typedNote.content.trim() : ''

      if (!type || !content) {
        return null
      }

      return {
        id: `typed-${index}`,
        type,
        content,
      }
    })
    .filter((note): note is { id: string; type: DriverStopRowNoteType; content: string } => Boolean(note))
    .sort((left, right) => STOP_ROW_NOTE_PRIORITY[left.type] - STOP_ROW_NOTE_PRIORITY[right.type])

  return candidates.map((note) => {
    const style = STOP_ROW_NOTE_STYLES[note.type]
    return {
      id: note.id,
      type: note.type,
      label: style.label,
      content: note.content,
      containerClassName: style.containerClassName,
      labelClassName: style.labelClassName,
      contentClassName: style.contentClassName,
    }
  })
}

export function mapStopRowOrderNote(
  notes: Order['order_notes'] | unknown,
): DriverStopRowNoteDisplay | null {
  return mapStopOrderNotes(notes)[0] ?? null
}
