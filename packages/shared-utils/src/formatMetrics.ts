type MetricUnit = 'kg' | '㎥' | 'm3' | 'm³'

const normalizeVolumeUnit = (unit: MetricUnit) => {
  if (unit === 'm3' || unit === 'm³' || unit === '㎥') return '㎥'
  return unit
}

export const formatMetric = (value: number, unit: MetricUnit) => {
  const safeValue = Number.isFinite(value) ? value : 0

  let convertedValue = safeValue
  let normalizedUnit = normalizeVolumeUnit(unit)

  if (normalizedUnit === 'kg') {
    const kilograms = safeValue / 1000

    if (kilograms > 1000) {
      convertedValue = kilograms / 1000
      normalizedUnit = 'tons'
    } else {
      convertedValue = kilograms
    }
  }

  if (normalizedUnit === '㎥') {
    convertedValue = safeValue / 1_000_000
  }

  const rounded = Number(convertedValue.toFixed(2))
  return `${rounded} ${normalizedUnit}`
}
