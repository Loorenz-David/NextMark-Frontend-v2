import { describe, expect, it } from 'vitest'
import { createTouchDragIntent, recentSpeed, TOUCH_DRAG_INTENT_DEFAULTS, type TouchDragIntentConfig } from './touchDragIntent'

const start = { t: 0, x: 0, y: 0 }
const make = (overrides: Partial<TouchDragIntentConfig> = {}) =>
  createTouchDragIntent({ ...TOUCH_DRAG_INTENT_DEFAULTS, ...overrides }, start)

describe('touch drag intent', () => {
  it('activates at the hold threshold, but not a millisecond earlier', () => {
    const intent = make()
    expect(intent.holdElapsed(219).effect).toBe('none')
    expect(intent.holdElapsed(220).effect).toBe('activate')
    expect(intent.phase()).toBe('active')
  })

  it('stays pending through drift inside the tolerance radius', () => {
    const intent = make()
    expect(intent.move({ t: 90, x: 6, y: 5 }, true).effect).toBe('none')
    expect(intent.phase()).toBe('pending')
  })

  it('lets an immediate flick scroll', () => {
    const intent = make()
    expect(intent.move({ t: 60, x: 9, y: 0 }, true)).toEqual({ effect: 'abort', preventDefault: false })
  })

  it('activates after a pause and slow movement in any direction', () => {
    for (const y of [-9, 9]) {
      const intent = make()
      intent.move({ t: 120, x: 0, y: 0 }, true)
      expect(intent.move({ t: 150, x: 0, y }, true)).toEqual({ effect: 'activate', preventDefault: true })
      expect(intent.metrics().recentSpeed).toBeCloseTo(0.3)
    }
  })

  it('lets a flick after a rest scroll', () => {
    const intent = make({ holdMs: 400 })
    intent.move({ t: 294, x: 0, y: 0 }, true)
    expect(intent.move({ t: 300, x: 9, y: 0 }, true)).toEqual({ effect: 'abort', preventDefault: false })
    expect(intent.metrics().recentSpeed).toBeCloseTo(1.5)
  })

  it('aborts when the deciding move cannot be canceled', () => {
    const intent = make()
    expect(intent.move({ t: 150, x: 9, y: 0 }, false)).toEqual({ effect: 'abort', preventDefault: false })
  })

  it('moves after activation and ignores moves after abort', () => {
    const active = make()
    active.holdElapsed(220)
    expect(active.move({ t: 230, x: 10, y: 0 }, true)).toEqual({ effect: 'drag-move', preventDefault: true })
    const aborted = make()
    aborted.move({ t: 60, x: 9, y: 0 }, true)
    expect(aborted.move({ t: 200, x: 20, y: 0 }, true)).toEqual({ effect: 'none', preventDefault: false })
    expect(aborted.holdElapsed(220).effect).toBe('none')
  })

  it('handles sparse and same-time samples without dividing by zero', () => {
    expect(recentSpeed([], 50)).toBe(0)
    expect(recentSpeed([start], 50)).toBe(0)
    expect(recentSpeed([start, { t: 0, x: 9, y: 0 }], 50)).toBe(0)
    expect(recentSpeed([start, { t: 100, x: 10, y: 0 }], 0)).toBe(0)
    expect(recentSpeed([start, { t: 100, x: 10, y: 0 }], 50)).toBe(0)
  })
})
