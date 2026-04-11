import { useMemo } from 'react'
import { OperatingHoursEditor } from '@/shared/inputs/OperatingHoursEditor'

import type { CostumerFormLayoutModel } from '../CostumerForm.layout.model'
import { WEEKDAY_OPTIONS } from '../flows/costumerOperatingHours.flow'

type CostumerOperatingHoursEditorProps = {
  model: CostumerFormLayoutModel
}

export const CostumerOperatingHoursEditor = ({ model }: CostumerOperatingHoursEditorProps) => {
  const entries = useMemo(
    () =>
      model.formState.operating_hours.map((entry) => ({
        key: entry.weekday,
        enabled: true,
        isClosed: Boolean(entry.is_closed),
        openTime: entry.open_time ?? null,
        closeTime: entry.close_time ?? null,
      })),
    [model.formState.operating_hours],
  )

  const toggleDaySelection = (weekday: number) => {
    const isSelected = model.formState.operating_hours.some((entry) => entry.weekday === weekday)
    if (isSelected) {
      model.formSetters.removeOperatingDay(weekday)
      return
    }
    model.formSetters.toggleOperatingDay(weekday)
  }

  return (
    <OperatingHoursEditor
      days={WEEKDAY_OPTIONS.map((day) => ({ key: day.weekday, label: day.longLabel }))}
      entries={entries}
      onToggleDay={toggleDaySelection}
      onOpenTimeChange={(weekday, value) => model.formSetters.setOperatingDayOpenTime(weekday, value)}
      onCloseTimeChange={(weekday, value) => model.formSetters.setOperatingDayCloseTime(weekday, value)}
      onClosedChange={(weekday, value) => model.formSetters.setOperatingDayClosed(weekday, value)}
      allowClosedToggle={true}
    />
  )
}
