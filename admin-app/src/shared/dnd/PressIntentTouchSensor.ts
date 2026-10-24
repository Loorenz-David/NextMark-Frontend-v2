import type { TouchEvent as ReactTouchEvent } from 'react'
import type { SensorInstance, SensorProps } from '@dnd-kit/core'
import {
  createTouchDragIntent,
  type TouchDragIntentConfig,
  type TouchSample,
} from './domain/touchDragIntent'

export type TouchIntentDecisionInfo = {
  decision: 'activate' | 'abort'
  path: 'hold' | 'move' | 'scroll' | 'cancel'
  elapsedMs: number
  distancePx: number
  recentSpeed: number
  cancelable?: boolean
}

type PressIntentTouchSensorOptions = {
  config: TouchDragIntentConfig
  onActivation?: ({ event }: { event: Event }) => void
  onIntentDecision?: (info: TouchIntentDecisionInfo) => void
}

export class PressIntentTouchSensor implements SensorInstance {
  autoScrollEnabled = true

  static activators = [{
    eventName: 'onTouchStart' as const,
    handler: ({ nativeEvent: event }: ReactTouchEvent, options: PressIntentTouchSensorOptions) => {
      if (event.touches.length !== 1) return false
      options.onActivation?.({ event })
      return true
    },
  }]

  static setup() {
    // Safari needs a non-passive touchmove listener present before a dynamic
    // gesture listener can prevent the first move that leaves the tolerance.
    const noop = () => {}
    window.addEventListener('touchmove', noop, { passive: false })
    return () => window.removeEventListener('touchmove', noop)
  }

  private readonly props: SensorProps<PressIntentTouchSensorOptions>
  private readonly target: EventTarget
  private readonly doc: Document
  private readonly win: Window
  private readonly touchId: number
  private readonly start: TouchSample
  private readonly intent: ReturnType<typeof createTouchDragIntent>
  private readonly node: HTMLElement | null
  private holdTimer: ReturnType<typeof setTimeout> | null = null
  private cueTimer: ReturnType<typeof setTimeout> | null = null
  private finished = false

  constructor(props: SensorProps<PressIntentTouchSensorOptions>) {
    this.props = props
    const event = props.event as TouchEvent
    const touch = event.changedTouches[0]
    this.touchId = touch.identifier
    this.start = { t: performance.now(), x: touch.clientX, y: touch.clientY }
    this.intent = createTouchDragIntent(props.options.config, this.start)
    this.target = event.target ?? document
    this.doc = this.target instanceof Node ? this.target.ownerDocument ?? document : document
    this.win = this.doc.defaultView ?? window
    this.node = props.activeNode.node.current

    this.target.addEventListener('touchmove', this.handleMove as EventListener, { passive: false })
    this.target.addEventListener('touchend', this.handleEnd as EventListener)
    this.target.addEventListener('touchcancel', this.handleCancel as EventListener)
    this.target.addEventListener('touchstart', this.handleExtraTouch as EventListener)
    this.win.addEventListener('contextmenu', this.blockNative)
    this.win.addEventListener('selectstart', this.blockNative)
    this.win.addEventListener('dragstart', this.blockNative)
    this.win.addEventListener('resize', this.handleCancel)
    this.doc.addEventListener('visibilitychange', this.handleVisibility)
    this.doc.addEventListener('keydown', this.handleKeydown)
    this.doc.addEventListener('scroll', this.handleScroll, { capture: true, passive: true })

    props.onPending(props.active, {
      delay: props.options.config.holdMs,
      tolerance: props.options.config.tolerancePx,
    }, { x: this.start.x, y: this.start.y })
    this.cueTimer = setTimeout(() => {
      if (this.intent.phase() === 'pending') this.node?.setAttribute('data-touch-drag', 'pressing')
    }, props.options.config.pressCueDelayMs)
    this.holdTimer = setTimeout(() => {
      if (this.intent.holdElapsed(performance.now()).effect === 'activate') {
        this.report('activate', 'hold')
        this.activate()
      }
    }, props.options.config.holdMs)
  }

  private report(decision: TouchIntentDecisionInfo['decision'], path: TouchIntentDecisionInfo['path'], cancelable?: boolean) {
    this.props.options.onIntentDecision?.({ decision, path, ...this.intent.metrics(), cancelable })
  }

  private activate() {
    if (this.finished) return
    if (this.holdTimer !== null) clearTimeout(this.holdTimer)
    if (this.cueTimer !== null) clearTimeout(this.cueTimer)
    this.node?.setAttribute('data-touch-drag', 'active')
    this.doc.addEventListener('click', this.stopClick, true)
    this.doc.getSelection()?.removeAllRanges()
    this.props.onStart({ x: this.start.x, y: this.start.y })
  }

  private handleMove = (event: TouchEvent) => {
    if (this.finished) return
    if (event.touches.length !== 1) return this.cancel('cancel')
    const touch = Array.from(event.touches).find((candidate) => candidate.identifier === this.touchId)
    if (!touch) return this.cancel('cancel')
    const result = this.intent.move({ t: performance.now(), x: touch.clientX, y: touch.clientY }, event.cancelable)
    if (result.preventDefault) event.preventDefault()
    if (result.effect === 'activate') {
      this.report('activate', 'move', event.cancelable)
      this.activate()
      this.props.onMove({ x: touch.clientX, y: touch.clientY })
    } else if (result.effect === 'drag-move') {
      this.props.onMove({ x: touch.clientX, y: touch.clientY })
    } else if (result.effect === 'abort') {
      this.report('abort', 'move', event.cancelable)
      this.cancel('move', false)
    }
  }

  private handleExtraTouch = (event: TouchEvent) => {
    if (event.touches.length > 1) this.cancel('cancel')
  }

  private handleEnd = (event: TouchEvent) => {
    if (!Array.from(event.changedTouches).some((touch) => touch.identifier === this.touchId)) return
    const wasActive = this.intent.phase() === 'active'
    this.detach()
    if (!wasActive) this.props.onAbort(this.props.active)
    this.props.onEnd()
  }

  private handleCancel = () => this.cancel('cancel')
  private handleVisibility = () => { if (this.doc.hidden) this.cancel('cancel') }
  private handleKeydown = (event: KeyboardEvent) => { if (event.key === 'Escape') this.cancel('cancel') }
  private handleScroll = () => { if (this.intent.phase() === 'pending') this.cancel('scroll') }
  private blockNative = (event: Event) => { if (event.cancelable) event.preventDefault() }
  private stopClick = (event: Event) => { event.stopPropagation() }

  private cancel(path: TouchIntentDecisionInfo['path'], report = true) {
    if (this.finished) return
    const wasActive = this.intent.phase() === 'active'
    if (!wasActive) {
      this.intent.abort()
      if (report) this.report('abort', path)
    }
    this.detach()
    if (!wasActive) this.props.onAbort(this.props.active)
    this.props.onCancel()
  }

  private detach() {
    if (this.finished) return
    this.finished = true
    if (this.holdTimer !== null) clearTimeout(this.holdTimer)
    if (this.cueTimer !== null) clearTimeout(this.cueTimer)
    this.node?.removeAttribute('data-touch-drag')
    this.target.removeEventListener('touchmove', this.handleMove as EventListener)
    this.target.removeEventListener('touchend', this.handleEnd as EventListener)
    this.target.removeEventListener('touchcancel', this.handleCancel as EventListener)
    this.target.removeEventListener('touchstart', this.handleExtraTouch as EventListener)
    this.win.removeEventListener('contextmenu', this.blockNative)
    this.win.removeEventListener('selectstart', this.blockNative)
    this.win.removeEventListener('dragstart', this.blockNative)
    this.win.removeEventListener('resize', this.handleCancel)
    this.doc.removeEventListener('visibilitychange', this.handleVisibility)
    this.doc.removeEventListener('keydown', this.handleKeydown)
    this.doc.removeEventListener('scroll', this.handleScroll, true)
    setTimeout(() => this.doc.removeEventListener('click', this.stopClick, true), 50)
  }
}
