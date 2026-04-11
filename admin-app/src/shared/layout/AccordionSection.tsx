import { useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { ChevronDownIcon } from '@/assets/icons'


type AccordionSectionProps = {
  title: string | ReactNode
  children: ReactNode
  defaultOpen?: boolean
  isOpen?: boolean 
  onToggle?: ()=> void
}

export const AccordionSection = ({
  title,
  children,
  defaultOpen = false,
  isOpen,
  onToggle
}: AccordionSectionProps) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen)

    const isControlled = isOpen !== undefined
    const open = isControlled ? isOpen : internalOpen


    const toggle = () => {
        if (isControlled) {
            onToggle?.()
        } else {
            setInternalOpen(prev => !prev)
        }
    }


    return (
        <section className={`w-full border border-[var(--color-muted)]/40 rounded-xl ` +
            (open ? 'shadow-md' : '')
        }
            
        >
            <button
            type="button"
            onClick={toggle}
            className="flex w-full items-center justify-between rounded-xl   bg-[var(--color-page)] px-4 py-3 text-left"
            >
            {typeof title === 'string' ? (
                <span className="text-md font-bold text-[var(--color-muted)]">
                {title}
                </span>
            ) : (
                <div className="flex flex-1 items-center ">{title}</div>
            )}
            <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
            >
                <ChevronDownIcon className="h-4 w-4 text-[var(--color-muted)]" />
            </motion.div>
            </button>

            <AnimatePresence initial={false}>
            {open && (
                <motion.div
                key="accordion-content"
                initial={{ height: 0, opacity: 0, y: -4 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className=""
                >
                <div className="flex flex-col gap-3 mt-2 mb-2  px-4 pb-5 ">
                    {children}
                </div>
                </motion.div>
            )}
            </AnimatePresence>
        </section>
  )
}

type PropsDescriptiveTitle = {
    icon?: ReactNode
    header: string
    description: string
}
export const DescriptiveTitle = ({
    icon,
    header,
    description
}: PropsDescriptiveTitle)=>{

    return(
          <div className="flex">
                {icon}
                <div className="flex flex-col gap-1">
                    <span className="text-md font-bold text-[var(--color-muted)]">
                        {header}
                    </span>
                    <span className="text-xs  text-[var(--color-muted)]/80 ">
                        {description}
                    </span>
                </div>
            </div>
    )
}