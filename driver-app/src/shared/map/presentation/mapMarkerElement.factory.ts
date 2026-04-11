import homeStartIconSvg from '@/assets/icons/HomeStartIcon.svg?raw'
import finishIconSvg from '@/assets/icons/FinishIcon.svg?raw'
import type { MapMarker, MapMarkerIconName } from '../domain/entities/MapMarker'

const CONTENT_CLASS = 'map-marker__content'
const MARKER_ICON_BY_NAME: Record<MapMarkerIconName, string> = {
  'home-start': homeStartIconSvg,
  finish: finishIconSvg,
}

function applyMarkerClasses(element: HTMLElement, className?: string) {
  if (!className) {
    return
  }

  const classNames = className
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean)

  if (classNames.length > 0) {
    element.classList.add(...classNames)
  }
}

const ensureMarkerContentElement = (element: HTMLElement): HTMLElement => {
  const existing = element.querySelector(`.${CONTENT_CLASS}`) as HTMLElement | null
  if (existing) {
    return existing
  }

  const content = document.createElement('span')
  content.className = CONTENT_CLASS
  element.appendChild(content)
  return content
}

function buildMarkerIconElement(iconName: MapMarkerIconName) {
  const template = document.createElement('template')
  template.innerHTML = MARKER_ICON_BY_NAME[iconName].trim()

  const svg = template.content.querySelector('svg')
  if (!svg) {
    return null
  }

  svg.classList.add('map-marker__icon')
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  svg.setAttribute('fill', 'currentColor')
  svg.querySelectorAll('[fill]').forEach((node) => {
    node.setAttribute('fill', 'currentColor')
  })

  return svg
}

export function applyMarkerContent(element: HTMLElement, mapMarker: MapMarker) {
  const content = ensureMarkerContentElement(element)
  const nextLabel = mapMarker.label ?? ''
  if (nextLabel) {
    content.textContent = nextLabel
    return
  }

  content.textContent = ''
  if (mapMarker.iconName) {
    const icon = buildMarkerIconElement(mapMarker.iconName)
    if (icon) {
      content.appendChild(icon)
      return
    }
  }

  const dot = document.createElement('span')
  dot.className = 'map-marker__dot'
  content.appendChild(dot)
}

export function createMarkerElement(mapMarker: MapMarker) {
  const element = document.createElement('div')

  if (mapMarker.markerColor) {
    element.style.setProperty('--marker-bg', mapMarker.markerColor)
  } else {
    element.style.removeProperty('--marker-bg')
  }

  const interactionVariant = mapMarker.interactionVariant ?? 'default'
  element.className = 'map-marker'
  element.dataset.markerVariant = interactionVariant
  element.classList.add(`map-marker--variant-${interactionVariant}`)

  if (mapMarker.status) {
    element.classList.add(`${mapMarker.status}-marker`)
  }

  applyMarkerClasses(element, mapMarker.className)

  applyMarkerContent(element, mapMarker)
  return element
}
