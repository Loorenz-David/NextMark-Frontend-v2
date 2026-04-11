import { QuestionIcon } from '@/assets/icons'
import { cn } from '@/lib/utils/cn'
import { SlideCarousel } from '@/shared/layout/slideCarousel'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'

import type { InfoHoverMessage, InfoHoverProps } from './InfoHover.types'
import { useInfoHoverController } from './useInfoHoverController'

const DEFAULT_TEXT_TRIGGER_CLASSES = 'cursor-help underline underline-offset-2 text-[var(--color-text)]'
const DEFAULT_ICON_TRIGGER_CLASSES = 'rounded-full bg-[var(--color-border)]/50 p-1 text-[var(--color-text)]'
const DEFAULT_ICON_CLASSES = 'h-3 w-3'
const DEFAULT_OVERLAY_CLASSES =
  'max-w-[280px] rounded-[20px] border border-[rgba(112,222,208,0.24)] bg-[linear-gradient(135deg,rgba(72,180,194,0.18),rgba(111,224,207,0.07))] p-3 text-sm text-[rgb(232,255,251)] shadow-[0_18px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl'

const renderMessageCard = (message: InfoHoverMessage) => (
  <div className="flex h-full w-full flex-col gap-2 p-1">
    {message.title ? (
      <div className="text-xs font-semibold text-[rgb(232,255,251)]">
        {message.title}
      </div>
    ) : null}
    <div className="text-xs leading-relaxed text-[rgb(220,248,243)]">
      {message.content}
    </div>
  </div>
)

export const InfoHover = ({
  content,
  triggerVariant = 'icon',
  triggerText,
  triggerClassName,
  overlayClassName,
  iconClassName,
  renderInPortal = true,
  placement = 'right',
  offset = 8,
  interactive = false,
}: InfoHoverProps) => {
  const controller = useInfoHoverController()
  const messages = Array.isArray(content) ? content : [content]

  const handleTriggerClick = () => {
    if (!controller.isTouchMode) {
      return
    }

    controller.setIsOpen(!controller.isOpen)
  }

  const triggerNode = triggerVariant === 'text'
    ? (
        <button
          type="button"
          aria-describedby={controller.popoverId}
          aria-haspopup="dialog"
          aria-expanded={controller.isOpen}
          className={cn(
            triggerClassName ?? DEFAULT_TEXT_TRIGGER_CLASSES,
          )}
          onClick={handleTriggerClick}
          {...controller.triggerEvents}
        >
          {triggerText}
        </button>
      )
    : (
        <button
          type="button"
          aria-describedby={controller.popoverId}
          aria-haspopup="dialog"
          aria-expanded={controller.isOpen}
          className={cn(
            'inline-flex items-center justify-center',
            triggerClassName ?? DEFAULT_ICON_TRIGGER_CLASSES,
          )}
          onClick={handleTriggerClick}
          {...controller.triggerEvents}
        >
          <QuestionIcon className={cn(iconClassName ?? DEFAULT_ICON_CLASSES)} />
        </button>
      )

  return (
    <FloatingPopover
      open={controller.isOpen}
      onOpenChange={(nextOpen) => {
        controller.setIsOpen(nextOpen)
      }}
      reference={triggerNode}
      offSetNum={offset}
      renderInPortal={renderInPortal}
      placement={placement}
      classes="inline-flex flex-none"
      outsidePressEvent="mousedown"
    >
      <div
        id={controller.popoverId}
        role={interactive ? 'dialog' : 'tooltip'}
        tabIndex={-1}
        className={cn(
          'min-w-0',
          overlayClassName ?? DEFAULT_OVERLAY_CLASSES,
        )}
        onClick={(event) => {
          event.stopPropagation()
        }}
        {...controller.overlayEvents}
      >
        {messages.length > 1 ? (
          <SlideCarousel>
            {messages.map((message, index) => (
              <div key={index} className="min-w-0">
                {renderMessageCard(message)}
              </div>
            ))}
          </SlideCarousel>
        ) : (
          renderMessageCard(messages[0] as InfoHoverMessage)
        )}
      </div>
    </FloatingPopover>
  )
}
