import type { CSSProperties } from 'react'

import type { SpinnerPrimitiveProps } from '@/shared/spiners/types'

const mergeStyles = (
  width: number | string,
  height: number | string,
  style?: CSSProperties,
): CSSProperties => ({
  width,
  height,
  borderRadius: '9999px',
  border: '3px solid rgba(120, 130, 150, 0.25)',
  borderTopColor: 'var(--color-dark-blue)',
  ...style,
})

export const CircularSpinner = ({
  width,
  height,
  className,
  style,
}: SpinnerPrimitiveProps) => {
  return (
    <div
      className={['animate-spin', className].filter(Boolean).join(' ')}
      style={mergeStyles(width, height, style)}
    />
  )
}
