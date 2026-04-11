import { useState } from 'react'
import type { ReactNode } from 'react'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'

export type ThreeDotMenuOption = {
  label: string
  action: () => void
  icon?: ReactNode
  disabled?: boolean
}

type Props = {
  options: ThreeDotMenuOption[]
  width?: number
  height?:number
  triggerClassName?: string
  dotWidth?: number
  dotHeight?: number
  dotClassName?: string
}

type TriggerProps = {
  onClick?: () => void
  triggerClassName?: string
  dotWidth: number
  dotHeight: number
  dotClassName?: string
}

const ThreeDotTrigger = ({
  onClick,
  triggerClassName,
  dotWidth,
  dotHeight,
  dotClassName,
}: TriggerProps) => {
  return (
    <div
      role="button"
      onClick={onClick}
      aria-label="Open menu"
      className={`
        flex items-center justify-center
        ${triggerClassName ?? ''}
      `}
    >
      <div className="flex flex-col items-center justify-center gap-[3px]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: `${dotWidth}px`,
              height: `${dotHeight}px`,
            }}
            className={`rounded-full  ${dotClassName ?? ''}`}
          />
        ))}
      </div>
    </div>
  )
}

export const ThreeDotMenu = ({
  options,
  width = 200,

  triggerClassName,
  dotWidth = 4,
  dotHeight = 4,
  dotClassName,
}: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <FloatingPopover
      open={open}
      onOpenChange={setOpen}
      offSetNum={6}
      closeOnInsideClick
      reference={
        <ThreeDotTrigger
          onClick={() => setOpen((prev) => !prev)}
          dotWidth={dotWidth}
          dotHeight={dotHeight}
          dotClassName={dotClassName}
          triggerClassName={triggerClassName}
        />
      }
    >
      <div
        style={{ width: `${width}px`}}
        className="admin-glass-popover rounded-lg border border-[var(--color-border-accent)] py-1 px-1 shadow-md"
      >
        {options.map((option) => (
          <div
            key={option.label}
            role="button"
            data-popover-close

            onClick={() => {
              if (option.disabled) return
              option.action()
              setOpen(false)
            }}
            className="
              flex w-full items-center gap-3
              px-3 py-2
              text-left
              text-[var(--color-text)]
              hover:bg-white/[0.08]
              disabled:cursor-not-allowed
              disabled:opacity-50
              cursor-pointer
              rounded-lg
              transition-colors
            "
          >
            <div className="flex h-5 w-5 items-center justify-center">{option.icon ?? null}</div>

            <span className="flex-1 text-sm">{option.label}</span>
          </div>
        ))}
      </div>
    </FloatingPopover>
  )
}
