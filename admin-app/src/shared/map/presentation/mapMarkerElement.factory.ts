import type { MapOrder } from '../domain/entities/MapOrder'
import type { MapMarkerOperationDirection } from '../domain/entities/MapOrder'

const CONTENT_CLASS = 'map-marker__content'
const BADGES_CLASS = 'map-marker__operation-badges'
const ICON_CLASS = 'map-marker__icon'
const ICON_GROUP_CLASS = 'map-marker__icon-group'

const BOLD_ARROW_PATH =
  'M7.82054 20.7313C8.21107 21.1218 8.84423 21.1218 9.23476 20.7313L15.8792 14.0868C17.0505 12.9155 17.0508 11.0167 15.88 9.84497L9.3097 3.26958C8.91918 2.87905 8.28601 2.87905 7.89549 3.26958C7.50497 3.6601 7.50497 4.29327 7.89549 4.68379L14.4675 11.2558C14.8581 11.6464 14.8581 12.2795 14.4675 12.67L7.82054 19.317C7.43002 19.7076 7.43002 20.3407 7.82054 20.7313Z'

function createDirectionArrowSvg(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('width', '10')
  svg.setAttribute('height', '10')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', BOLD_ARROW_PATH)
  path.setAttribute('fill', 'currentColor')
  svg.appendChild(path)
  return svg
}

function createHomeSvg(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('width', '14')
  svg.setAttribute('height', '14')
  svg.setAttribute('aria-hidden', 'true')

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute(
    'd',
    'M4 10.75L12 4l8 6.75V20a1 1 0 0 1-1 1h-4.75v-5.5h-4.5V21H5a1 1 0 0 1-1-1v-9.25Z',
  )
  path.setAttribute('fill', 'currentColor')
  svg.appendChild(path)
  return svg
}

function createFinishFlagSvg(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('width', '14')
  svg.setAttribute('height', '14')
  svg.setAttribute('aria-hidden', 'true')

  const pole = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  pole.setAttribute('d', 'M6 3a1 1 0 0 1 1 1v16.5a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Z')
  pole.setAttribute('fill', 'currentColor')

  const flag = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  flag.setAttribute(
    'd',
    'M7 4.5h9.5l-2 3 2 3H7v-6Z',
  )
  flag.setAttribute('fill', 'currentColor')

  svg.appendChild(pole)
  svg.appendChild(flag)
  return svg
}

function applyBoundaryMarkerContent(
  content: HTMLElement,
  status: 'start' | 'end' | 'start_end',
) {
  content.textContent = ''

  if (status === 'start') {
    const icon = document.createElement('span')
    icon.className = `${ICON_CLASS} ${ICON_CLASS}--start`
    icon.appendChild(createHomeSvg())
    content.appendChild(icon)
    return
  }

  if (status === 'end') {
    const icon = document.createElement('span')
    icon.className = `${ICON_CLASS} ${ICON_CLASS}--end`
    icon.appendChild(createFinishFlagSvg())
    content.appendChild(icon)
    return
  }

  const group = document.createElement('span')
  group.className = ICON_GROUP_CLASS

  const startIcon = document.createElement('span')
  startIcon.className = `${ICON_CLASS} ${ICON_CLASS}--start`
  startIcon.appendChild(createHomeSvg())

  const arrow = document.createElement('span')
  arrow.className = `${ICON_CLASS} ${ICON_CLASS}--arrow`
  arrow.appendChild(createDirectionArrowSvg())

  const endIcon = document.createElement('span')
  endIcon.className = `${ICON_CLASS} ${ICON_CLASS}--end`
  endIcon.appendChild(createFinishFlagSvg())

  group.append(startIcon, arrow, endIcon)
  content.appendChild(group)
}

const addClassTokens = (el: HTMLElement, className?: string | null) => {
  if (!className) return
  const tokens = className.split(/\s+/).filter(Boolean)
  if (!tokens.length) return
  el.classList.add(...tokens)
}

const getStatusMarkerClassName = (status?: string) =>
  status ? `${status.replaceAll('_', '-')}-marker` : null

const ensureMarkerContentElement = (el: HTMLElement): HTMLElement => {
  const existing = el.querySelector(`.${CONTENT_CLASS}`) as HTMLElement | null
  if (existing) return existing

  const content = document.createElement('span')
  content.className = CONTENT_CLASS
  el.appendChild(content)
  return content
}

export function applyMarkerContent(el: HTMLElement, label?: string) {
  const content = ensureMarkerContentElement(el)
  const boundaryStatus =
    el.classList.contains('start-end-marker')
      ? 'start_end'
      : el.classList.contains('start-marker')
        ? 'start'
        : el.classList.contains('end-marker')
          ? 'end'
          : null

  if (boundaryStatus) {
    applyBoundaryMarkerContent(content, boundaryStatus)
    return
  }

  const nextLabel = label ?? ''
  if (nextLabel) {
    content.textContent = nextLabel
    return
  }

  content.textContent = ''
  const dot = document.createElement('span')
  dot.className = 'map-marker__dot'
  content.appendChild(dot)
}

export function applyOperationBadges(
  el: HTMLElement,
  directions?: MapMarkerOperationDirection[],
) {
  const previous = el.querySelector(`.${BADGES_CLASS}`)
  if (previous) {
    previous.remove()
  }

  if (!directions?.length) {
    return
  }

  const badges = document.createElement('span')
  badges.className = BADGES_CLASS

  directions.forEach((direction) => {
    const badge = document.createElement('span')
    badge.className = `map-marker__operation-badge map-marker__operation-badge--${direction}`
    badge.appendChild(createDirectionArrowSvg())
    badges.appendChild(badge)
  })

  el.appendChild(badges)
}

export function createMarkerElement(order: MapOrder) {
  const el = document.createElement('div')

  if (order.markerColor) {
    el.style.setProperty('--marker-bg', order.markerColor)
  } else {
    el.style.removeProperty('--marker-bg')
  }

  const interactionVariant = order.interactionVariant ?? 'default'
  el.className = 'map-marker'
  el.dataset.markerVariant = interactionVariant
  el.classList.add(`map-marker--variant-${interactionVariant}`)

  if (order.status) {
    const statusClassName = getStatusMarkerClassName(order.status)
    if (statusClassName) {
      el.classList.add(statusClassName)
    }
  }

  if (order.className) {
    addClassTokens(el, order.className)
  }

  applyMarkerContent(el, order.label)
  applyOperationBadges(el, order.operationBadgeDirections)

  return el
}
