import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { ChevronDownIcon } from '@/assets/icons'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'
import { cn } from '@/lib/utils/cn'
import type{ CSSProperties } from 'react'
import type { Placement } from '@floating-ui/react'

import { BasicButton } from './BasicButton'
import {  type ButtonParams, type ButtonVariant } from './Button.constants'

type DropdownButtonProps = {
  label: string | ReactNode
  onClick?: () => void
  children: ReactNode
  variant?: ButtonVariant
  disabled?: boolean
  className?: string
  style?: CSSProperties
  ariaLabel?: string
  borderColor?:string
  fullWidth?: boolean
  removeFlip?: boolean
  renderInPortal?: boolean
  placement?: Placement
  floatingClassName?: string
}

export const DropdownButton = ({
  label,
  onClick,
  children,
  variant = 'secondary',
  disabled = false,
  className,
  style,
  ariaLabel,
  borderColor,
  fullWidth = false,
  removeFlip,
  renderInPortal,
  placement,
  floatingClassName,
}: DropdownButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const baseParams: ButtonParams = {
    variant,
    disabled,
    ariaLabel,
    style
  }

  return (
   
     

      <FloatingPopover
        open={isOpen}
        onOpenChange={setIsOpen}
        matchReferenceWidth={true}
        closeOnInsideClick={true}
        offSetNum={2}
        removeFlip={removeFlip}
        renderInPortal={renderInPortal}
        placement={placement}
        floatingClassName={floatingClassName}
        reference={

           <div  className={cn(fullWidth ? 'flex w-full items-stretch h-full' : 'inline-flex items-stretch', className, 'rounded-lg' )}
              style={
                borderColor ? 
                {border: borderColor + '0.5px solid'}
                : {}
              }
           >
             <BasicButton
                params={{
                  ...baseParams,
                  onClick,
                  className: cn('rounded-r-none', fullWidth && 'w-full'),
                }}
              >
                {label}
              </BasicButton>

              <BasicButton
                params={{
                  ...baseParams,
                  onClick:() => setIsOpen((prev) => !prev),
                  className: cn(
                    `rounded-l-none border-l-[${borderColor ? borderColor : "var(--color-muted)"}] border-l-[0.5px]`,
                    fullWidth && 'flex-1',
                  ),
                  style:{paddingInline:'2.5px', }
                  
                }}
              >
                
                <ChevronDownIcon 
                  className={`h-4 w-4`}  
                  style={{ color: borderColor }}
                />
              </BasicButton>
            </div>


        
        }
      >
        <motion.div 
                key="content"
                initial={{ height: 0, opacity: 0, y: -4 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="admin-glass-popover rounded-lg border border-[var(--color-border-accent)] px-2 shadow-md"
            >
            <div className="py-2">
                {children}
            </div>
        </motion.div>
      </FloatingPopover>
    
  )
}
