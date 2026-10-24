import { forwardRef, type ReactNode } from 'react'

import { cn } from '../../lib/utils/cn'
import { useViewport } from '../../app/viewport'
import { buttonBaseClass, buttonVariantClasses, coarsePointerButtonClass, type ButtonParams } from './Button.constants'

interface BasicButtonProps {
  children: ReactNode
  params: ButtonParams
}

export const BasicButton = forwardRef<HTMLButtonElement, BasicButtonProps>(function BasicButton(
  { children, params },
  ref,
) {
  const { isCoarsePointer } = useViewport()
  const { 
    variant = 'secondary',
     onClick,
     type = 'button',
     disabled = false,
     className,
     ariaLabel,
     style
    } = params

  return (
    
    <button
      type={type}
      aria-label={ariaLabel}
      ref={ref}
      onClick={(e) => {
        e.currentTarget.blur()
        if (disabled) {
          e.preventDefault()
          return
        }
        e.stopPropagation()
        onClick?.()
      }}
      className={cn(
        buttonBaseClass,
        buttonVariantClasses[variant],
        className,
        isCoarsePointer && (variant === 'rounded' ? 'min-h-11 min-w-11' : coarsePointerButtonClass),
      )}
      style={ style }
      disabled={disabled}
    >
      {children}
    </button>
  )
})
