import { useSensor, useSensors } from '@dnd-kit/core'
import { CueMouseSensor } from './CueMouseSensor'
import { PressIntentTouchSensor, type TouchIntentDecisionInfo } from './PressIntentTouchSensor'
import { TOUCH_DRAG_INTENT_DEFAULTS } from './domain/touchDragIntent'

const onIntentDecision = import.meta.env.DEV
  ? (info: TouchIntentDecisionInfo) => window.__dndDebug?.push('intent', info)
  : undefined

export const useAppDragSensors = () => useSensors(
  useSensor(CueMouseSensor, { activationConstraint: { distance: 6 } }),
  useSensor(PressIntentTouchSensor, {
    config: TOUCH_DRAG_INTENT_DEFAULTS,
    onIntentDecision,
  }),
)
