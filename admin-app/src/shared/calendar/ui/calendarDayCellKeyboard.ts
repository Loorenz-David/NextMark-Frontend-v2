import type { KeyboardEvent } from 'react'

export const isSelectionActivationKey = (key: string): 'enter' | 'space' | null => {
  if (key === 'Enter') return 'enter'
  if (key === ' ') return 'space'
  return null
}

export const buildDayCellKeyDownHandler = ({
  onSelect,
  onKeyDown,
}: {
  onSelect: () => void
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void
}) => (event: KeyboardEvent<HTMLElement>) => {
  const activation = isSelectionActivationKey(event.key)
  if (activation === 'enter') onSelect()
  if (activation === 'space') {
    event.preventDefault()
    onSelect()
  }
  onKeyDown?.(event)
}
