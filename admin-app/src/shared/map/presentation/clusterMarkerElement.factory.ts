import type { ClusterRecord } from '../domain/entities/ClusterRecord'

const clusterSize = (count: number): number => {
  if (count < 10) return 36
  if (count < 100) return 44
  if (count < 1000) return 52
  return 60
}

const formatCount = (count: number): string => {
  if (count < 1000) return String(count)
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`
  return `${Math.floor(count / 1000)}k`
}

export const createClusterMarkerElement = (record: ClusterRecord): HTMLElement => {
  const el = document.createElement('div')
  applyClusterMarkerAppearance(el, record)

  const inner = document.createElement('div')
  inner.className = 'map-cluster-marker__inner'

  const label = document.createElement('span')
  label.className = 'map-cluster-marker__label'
  label.textContent = formatCount(record.pointCount)

  inner.appendChild(label)
  el.appendChild(inner)

  return el
}

export const applyClusterMarkerAppearance = (
  el: HTMLElement,
  record: ClusterRecord,
) => {
  el.className = 'map-cluster-marker'
  el.style.setProperty('--cluster-size', `${clusterSize(record.pointCount)}px`)

  const label = el.querySelector('.map-cluster-marker__label')
  if (label instanceof HTMLElement) {
    label.textContent = formatCount(record.pointCount)
  }
}
