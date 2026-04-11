import { CustomTimePicker } from '@/shared/inputs/CustomTimePicker'
import { useDeliveryWindowCalendarShellScale } from '../shell/DeliveryWindowCalendarShell.context'

type DeliveryWindowCalendarEditorProps = {
  isOpen: boolean
  comparisonDate?: string | null
  startTime: string | null
  endTime: string | null
  onChangeStartTime: (value: string | null) => void
  onChangeEndTime: (value: string | null) => void
  onCancel: () => void
  onApply: () => void
}

export const DeliveryWindowCalendarEditor = ({
  isOpen,
  comparisonDate,
  startTime,
  endTime,
  onChangeStartTime,
  onChangeEndTime,
  onCancel,
  onApply,
}: DeliveryWindowCalendarEditorProps) => {
  if (!isOpen) {
    return null
  }

  const shellScale = useDeliveryWindowCalendarShellScale()
  const { editor } = shellScale

  return (
    <div className={editor.rootClassName}>
      <div className={editor.controlsRowClassName}>
        <div className={editor.headerRowClassName}>
          <div className={editor.titleClassName}>Set time window</div>
          <div className="flex items-center gap-2">
            <div>
              <CustomTimePicker
                selectedTime={startTime}
                onChange={(value) => onChangeStartTime(value || null)}
                disablePastForDate={comparisonDate}
                className={editor.pickerClassName}
              />
            </div>
            <span className={editor.betweenLabelClassName}>to</span>
            <div>
              <CustomTimePicker
                selectedTime={endTime}
                onChange={(value) => onChangeEndTime(value || null)}
                disablePastForDate={comparisonDate}
                className={editor.pickerClassName}
              />
            </div>
          </div>
        </div>
        <div className={editor.actionsClassName}>
          <button
            type="button"
            onClick={onCancel}
            className={editor.cancelButtonClassName}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApply}
            className={editor.applyButtonClassName}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
