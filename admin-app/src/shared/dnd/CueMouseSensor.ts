import { MouseSensor, type MouseSensorOptions, type SensorProps } from '@dnd-kit/core'

import { PRESS_CUE_DELAY_MS, setDragCue } from './dragCue'

/**
 * dnd-kit's MouseSensor with the same press and lift cue as the touch sensor.
 * Activation is untouched (press and move 6px): the cue is added by wrapping
 * the public sensor callbacks, never by reaching into the sensor's internals.
 */
export class CueMouseSensor extends MouseSensor {
  constructor(props: SensorProps<MouseSensorOptions>) {
    const node = props.activeNode.node.current
    let cueTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      cueTimer = null
      setDragCue(node, 'pressing')
    }, PRESS_CUE_DELAY_MS)
    const settle = (cue: 'active' | null) => {
      if (cueTimer !== null) clearTimeout(cueTimer)
      cueTimer = null
      setDragCue(node, cue)
    }

    super({
      ...props,
      onStart: (coordinates) => {
        settle('active')
        props.onStart(coordinates)
      },
      onAbort: (id) => {
        settle(null)
        props.onAbort(id)
      },
      onEnd: () => {
        settle(null)
        props.onEnd()
      },
      onCancel: () => {
        settle(null)
        props.onCancel()
      },
    })
  }
}
