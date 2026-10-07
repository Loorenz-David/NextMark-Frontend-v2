import type { ReactNode } from 'react'

export type BottomSheetProps = {
  open: boolean
  onClose: () => void
  /** Accessible name; rendered as the sheet header when `showHeader` is true. */
  title?: ReactNode
  /** Render the title row with a close button. Defaults to true when a title is given. */
  showHeader?: boolean
  children: ReactNode
  /** Max height as a CSS length. Defaults to 85dvh. */
  maxHeight?: string
  /** Extra classes for the scrolling body. */
  bodyClassName?: string
  /**
   * Register with the bottom-sheet registry so a shell can close it on back.
   * A shell that already tracks this sheet as its own layer passes false.
   */
  trackForBack?: boolean
}

export type ActionSheetOption = {
  label: string
  action: () => void
  icon?: ReactNode
  disabled?: boolean
  destructive?: boolean
  /** Two-tap confirmation: the row turns into this label for `confirmDurationMs`. */
  confirmLabel?: ReactNode
  confirmDurationMs?: number
}

export type ActionSheetProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
  options: ActionSheetOption[]
}
