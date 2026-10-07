import { useEffect, useRef, useState } from 'react'

import { BottomSheet } from './BottomSheet'
import type { ActionSheetOption, ActionSheetProps } from './bottomSheet.types'

const DEFAULT_CONFIRM_MS = 4000

const ActionSheetRow = ({
  option,
  onDone,
}: {
  option: ActionSheetOption
  onDone: () => void
}) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    },
    [],
  )

  const run = () => {
    option.action()
    onDone()
  }

  const handleTap = () => {
    if (option.disabled) return
    if (!option.confirmLabel) {
      run()
      return
    }
    if (isConfirming) {
      run()
      return
    }
    setIsConfirming(true)
    timeoutRef.current = window.setTimeout(() => {
      setIsConfirming(false)
      timeoutRef.current = null
    }, option.confirmDurationMs ?? DEFAULT_CONFIRM_MS)
  }

  const tone = option.destructive || isConfirming ? 'text-danger' : 'text-[var(--color-text)]'

  return (
    <button
      type="button"
      disabled={option.disabled}
      aria-disabled={option.disabled}
      onClick={handleTap}
      className={`flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-[0.95rem] transition-colors active:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 ${tone} ${
        isConfirming ? 'bg-danger-bg' : ''
      }`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{option.icon ?? null}</span>
      <span className="min-w-0 flex-1 truncate">
        {isConfirming ? option.confirmLabel : option.label}
      </span>
    </button>
  )
}

/**
 * A list of tappable actions in a bottom sheet: the phone replacement for a
 * hover/click popover menu.
 */
export const ActionSheet = ({ open, onClose, title, options }: ActionSheetProps) => (
  <BottomSheet open={open} onClose={onClose} title={title} showHeader={title != null} bodyClassName="px-2 pb-2 pt-1">
    <div className="flex flex-col gap-0.5">
      {options.map((option) => (
        <ActionSheetRow key={option.label} option={option} onDone={onClose} />
      ))}
    </div>
  </BottomSheet>
)
