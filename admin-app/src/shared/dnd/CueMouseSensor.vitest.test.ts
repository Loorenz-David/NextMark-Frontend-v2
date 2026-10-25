// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MouseSensorOptions, SensorProps } from '@dnd-kit/core'

import { CueMouseSensor } from './CueMouseSensor'
import { DRAG_CUE_ATTRIBUTE, PRESS_CUE_DELAY_MS } from './dragCue'

const setup = () => {
  const node = document.createElement('div')
  document.body.appendChild(node)
  const event = new MouseEvent('mousedown', { clientX: 10, clientY: 10, button: 0 })
  Object.defineProperty(event, 'target', { value: node })
  const calls: string[] = []
  const props = {
    active: 'card-1',
    activeNode: { id: 'card-1', key: 'card-1', node: { current: node }, activatorNode: { current: node }, data: { current: {} } },
    event,
    context: { current: {} },
    options: { activationConstraint: { distance: 6 } },
    onAbort: () => calls.push('abort'),
    onPending: () => calls.push('pending'),
    onStart: () => calls.push('start'),
    onCancel: () => calls.push('cancel'),
    onMove: () => calls.push('move'),
    onEnd: () => calls.push('end'),
  } as unknown as SensorProps<MouseSensorOptions>
  return { node, props, calls }
}

const move = (x: number, y: number) =>
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y }))
const release = () => document.dispatchEvent(new MouseEvent('mouseup'))

describe('CueMouseSensor', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('shows the pressing cue only after the delay, so a quick click never flashes it', () => {
    const { node, props } = setup()
    new CueMouseSensor(props)
    vi.advanceTimersByTime(PRESS_CUE_DELAY_MS - 1)
    expect(node.getAttribute(DRAG_CUE_ATTRIBUTE)).toBeNull()
    release()
    vi.advanceTimersByTime(PRESS_CUE_DELAY_MS)
    expect(node.getAttribute(DRAG_CUE_ATTRIBUTE)).toBeNull()
  })

  it('squeezes while held, lifts on drag start, clears on drop, and still forwards every callback', () => {
    const { node, props, calls } = setup()
    new CueMouseSensor(props)
    vi.advanceTimersByTime(PRESS_CUE_DELAY_MS)
    expect(node.getAttribute(DRAG_CUE_ATTRIBUTE)).toBe('pressing')
    move(30, 10)
    expect(node.getAttribute(DRAG_CUE_ATTRIBUTE)).toBe('active')
    release()
    expect(node.getAttribute(DRAG_CUE_ATTRIBUTE)).toBeNull()
    expect(calls).toContain('start')
    expect(calls).toContain('end')
  })

  it('keeps mouse activation unchanged: no drag below 6px of movement', () => {
    const { node, props, calls } = setup()
    new CueMouseSensor(props)
    move(14, 10)
    expect(calls).not.toContain('start')
    release()
    expect(calls).toContain('abort')
    expect(node.getAttribute(DRAG_CUE_ATTRIBUTE)).toBeNull()
  })
})
