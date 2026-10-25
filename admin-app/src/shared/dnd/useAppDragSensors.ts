import { useSensor, useSensors } from '@dnd-kit/core'
import { CueMouseSensor } from './CueMouseSensor'
import { PressIntentTouchSensor } from './PressIntentTouchSensor'
import { TOUCH_DRAG_INTENT_DEFAULTS } from './domain/touchDragIntent'

export const useAppDragSensors = () => useSensors(
  useSensor(CueMouseSensor, { activationConstraint: { distance: 6 } }),
  useSensor(PressIntentTouchSensor, {
    config: TOUCH_DRAG_INTENT_DEFAULTS,
  }),
)
