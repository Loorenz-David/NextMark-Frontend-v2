import { DELIVERY_WINDOW_CALENDAR_MODE_OPTIONS, type DeliveryWindowCalendarMode } from '../../DeliveryWindowCalendar.types'
import { useDeliveryWindowCalendarShellScale } from '../shell/DeliveryWindowCalendarShell.context'
import { InfoHover } from '@/shared/layout/InfoHover'
import { ORDER_DELIVERY_WINDOW_MODE_INFO } from '../../../../info/deliveryWindowMode.info'

type DeliveryWindowCalendarModeSelectorProps = {
  mode: DeliveryWindowCalendarMode
  onChangeMode: (mode: DeliveryWindowCalendarMode) => void
}

export const DeliveryWindowCalendarModeSelector = ({
  mode,
  onChangeMode,
}: DeliveryWindowCalendarModeSelectorProps) => {
  const shellScale = useDeliveryWindowCalendarShellScale()
  const { mode: modeScale } = shellScale

  return (
    <div className="flex items-center gap-2">
      <div className={modeScale.rootClassName}>
        {DELIVERY_WINDOW_CALENDAR_MODE_OPTIONS.map((option) => {
          const isActive = option.value === mode

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChangeMode(option.value)}
              className={`${modeScale.buttonClassName} ${
                isActive
                  ? modeScale.activeButtonClassName
                  : modeScale.inactiveButtonClassName
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      <InfoHover content={ORDER_DELIVERY_WINDOW_MODE_INFO} />
    </div>
  )
}
