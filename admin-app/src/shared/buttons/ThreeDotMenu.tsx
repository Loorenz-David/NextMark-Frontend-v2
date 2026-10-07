import { useState } from 'react'
import type { ReactNode } from 'react'
import { useMobile } from '@/app/viewport'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'
import { ActionSheet, type ActionSheetOption } from '@/shared/overlays/bottomSheet'
import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'

export type ThreeDotMenuOptionConfirmation = {
  confirmContent: ReactNode
  confirmClassName?: string
  confirmOverLay?: string
  duration?: number
}

export type ThreeDotMenuOption = {
  label: string
  action: () => void
  icon?: ReactNode
  disabled?: boolean
  confirmation?: ThreeDotMenuOptionConfirmation
}

type Props = {
  options: ThreeDotMenuOption[]
  width?: number
  height?:number
  triggerClassName?: string
  dotWidth?: number
  dotHeight?: number
  dotClassName?: string
  renderInPortal?: boolean
}

type TriggerProps = {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
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
      // The order DnD sensors activate on mousedown / touchstart, which React
      // dispatches independently of pointerdown — guard all three.
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
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
  renderInPortal = false,
}: Props) => {
  const [open, setOpen] = useState(false)
  const { isCoarsePointer } = useMobile()

  // Fingers get a bottom sheet with full-width rows instead of a 190px
  // popover anchored to a 12px trigger. Confirmation stays two-tap.
  if (isCoarsePointer) {
    const sheetOptions: ActionSheetOption[] = options.map((option) => ({
      label: option.label,
      action: option.action,
      icon: option.icon,
      disabled: option.disabled,
      destructive: Boolean(option.confirmation),
      confirmLabel: option.confirmation?.confirmContent,
      confirmDurationMs: option.confirmation?.duration,
    }))

    return (
      <>
        <ThreeDotTrigger
          onClick={(event) => {
            event.stopPropagation()
            setOpen(true)
          }}
          dotWidth={dotWidth}
          dotHeight={dotHeight}
          dotClassName={dotClassName}
          triggerClassName={`touch-hit-area ${triggerClassName ?? ''}`}
        />
        <ActionSheet open={open} onClose={() => setOpen(false)} options={sheetOptions} />
      </>
    )
  }

  const renderOptionContent = (option: ThreeDotMenuOption) => (
    <div
      aria-disabled={option.disabled}
      className={`
        flex w-full items-center gap-3
        rounded-lg px-3 py-2
        text-left text-[var(--color-text)]
        transition-colors
        ${
          option.disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:bg-surface-hover'
        }
      `}
    >
      <div className="flex h-5 w-5 items-center justify-center">
        {option.icon ?? null}
      </div>

      <span className="flex-1 text-sm">{option.label}</span>
    </div>
  )

  return (
    <FloatingPopover
      open={open}
      onOpenChange={setOpen}
      offSetNum={6}
      renderInPortal={renderInPortal}
      reference={
        <ThreeDotTrigger
          onClick={(event) => {
            event.stopPropagation()
            setOpen((prev) => !prev)
          }}
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
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        {options.map((option) => {
          if (option.confirmation && !option.disabled) {
            return (
              <ConfirmActionButton
                key={option.label}
                onConfirm={() => {
                  option.action()
                  setOpen(false)
                }}
                deleteContent={renderOptionContent(option)}
                deleteClassName="w-full"
                confirmContent={option.confirmation.confirmContent}
                confirmClassName={option.confirmation.confirmClassName}
                confirmOverLay={option.confirmation.confirmOverLay}
                duration={option.confirmation.duration}
              />
            )
          }

          return (
            <div
              key={option.label}
              role="button"
              onClick={(event) => {
                event.stopPropagation()
                if (option.disabled) return
                option.action()
                setOpen(false)
              }}
            >
              {renderOptionContent(option)}
            </div>
          )
        })}
      </div>
    </FloatingPopover>
  )
}
