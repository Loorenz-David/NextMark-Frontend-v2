import { BasicButton } from '@/shared/buttons/BasicButton'

type PickerFooterProps = {
  onNow: () => void
  onCancel: () => void
  onDone: () => void
}

export const PickerFooter = ({ onNow, onCancel, onDone }: PickerFooterProps) => {
  return (
    <div
      className="flex items-center justify-between gap-2 border-t border-[var(--color-border-accent)]/60 p-3"
      onPointerDown={(event) => {
        event.stopPropagation()
      }}
      onMouseDown={(event) => {
        event.stopPropagation()
      }}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <BasicButton
        params={{
          variant: 'ghost',
          onClick: onNow,
          className: 'px-3 py-1 text-xs text-blue-600',
          ariaLabel: 'Select current time plus one minute',
        }}
      >
        Now
      </BasicButton>

      <div className="flex items-center gap-2">
      <BasicButton
        params={{
          variant: 'ghost',
          onClick: onCancel,
          className: 'px-3 py-1 text-xs text-[var(--color-muted)]',
          ariaLabel: 'Cancel time selection',
        }}
      >
        Cancel
      </BasicButton>
      <BasicButton
        params={{
          variant: 'secondary',
          onClick: onDone,
          className: 'px-3 py-1 text-xs',
          ariaLabel: 'Confirm time selection',
        }}
      >
        Done
      </BasicButton>
      </div>
    </div>
  )
}
