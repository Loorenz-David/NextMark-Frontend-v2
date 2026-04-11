import type { MapOrder } from '../domain/entities/MapOrder'
import type { MapMarkerOperationDirection } from '../domain/entities/MapOrder'

const CONTENT_CLASS = 'map-marker__content'
const BADGES_CLASS = 'map-marker__operation-badges'

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

const addClassTokens = (el: HTMLElement, className?: string | null) => {
  if (!className) return
  const tokens = className.split(/\s+/).filter(Boolean)
  if (!tokens.length) return
  el.classList.add(...tokens)
}

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
    el.classList.add(`${order.status}-marker`)
  }

  if (order.className) {
    addClassTokens(el, order.className)
  }

  applyMarkerContent(el, order.label)
  applyOperationBadges(el, order.operationBadgeDirections)

  return el
}
