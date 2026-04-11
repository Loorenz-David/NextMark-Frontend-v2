type MultiSegmentedOption = {
  label: string
  value: string | number
}

type SegmentedSelectStyleConfig = {
  containerPadding?: string | number
  gap?: string | number
  containerBg?: string
  containerBorder?: string
  containerShadow?: string
  selectedBg?: string
  selectedBorder?: string
  selectedShadow?: string
  textColor?: string
  buttonPadding?: string
  selectedTextColor?: string
  textSize?: string | number
}

type MultiSegmentedRules = {
  atLeastOneSelected?: boolean
  fallbackMode?: 'default_value' | 'switch_to_adjacent'
}

type MultiSegmentedCheckboxListProps = {
  options: MultiSegmentedOption[]
  selectedValues: Array<string | number>
  onChange: (nextValues: Array<string | number>) => void
  styleConfig?: SegmentedSelectStyleConfig
  rules?: MultiSegmentedRules
  defaultValue?: string | number
}

const DEFAULT_STYLE: Required<SegmentedSelectStyleConfig> = {
  containerBg: 'var(--color-muted)',
  containerBorder: 'transparent',
  containerShadow: 'none',
  selectedBg: '#ffffff',
  selectedBorder: 'transparent',
  selectedShadow: 'none',
  textColor: '#555',
  selectedTextColor: '#007bff',
  containerPadding: '4px',
  gap: '2px',
  buttonPadding: '8px 12px',
  textSize: '15px',
}

const toSizeValue = (value: string | number) =>
  typeof value === 'number' ? `${value}px` : value

const valuesEqual = (left: string | number, right: string | number) =>
  String(left) === String(right)

const dedupeByOptionOrder = (
  options: MultiSegmentedOption[],
  values: Array<string | number>,
) => {
  const included = new Set(values.map(String))
  return options
    .map((option) => option.value)
    .filter((value) => included.has(String(value)))
}

const resolveAdjacentValue = (
  options: MultiSegmentedOption[],
  currentValue: string | number,
) => {
  const currentIndex = options.findIndex((option) => valuesEqual(option.value, currentValue))
  if (currentIndex < 0) return null

  const right = options[currentIndex + 1]
  if (right) return right.value

  const left = options[currentIndex - 1]
  if (left) return left.value

  return null
}

export const MultiSegmentedCheckboxList = ({
  options,
  selectedValues,
  onChange,
  styleConfig,
  rules,
  defaultValue,
}: MultiSegmentedCheckboxListProps) => {
  const styles = {
    ...DEFAULT_STYLE,
    ...(styleConfig ?? {}),
  }

  const normalizedSelected = dedupeByOptionOrder(options, selectedValues)

  const handleToggle = (clickedValue: string | number) => {
    const isSelected = normalizedSelected.some((value) => valuesEqual(value, clickedValue))

    if (!isSelected) {
      onChange(dedupeByOptionOrder(options, [...normalizedSelected, clickedValue]))
      return
    }

    if (!rules?.atLeastOneSelected || normalizedSelected.length > 1) {
      onChange(normalizedSelected.filter((value) => !valuesEqual(value, clickedValue)))
      return
    }

    if (rules.fallbackMode === 'switch_to_adjacent') {
      const adjacent = resolveAdjacentValue(options, clickedValue)
      if (adjacent != null) {
        onChange([adjacent])
        return
      }
    }

    if (defaultValue != null) {
      const hasDefault = options.some((option) => valuesEqual(option.value, defaultValue))
      if (hasDefault) {
        onChange([defaultValue])
        return
      }
    }

    onChange(normalizedSelected)
  }

  return (
    <div
      className="flex w-full gap-[2px] rounded-lg"
      style={{
        position: 'relative',
        background: styles.containerBg,
        border: `1px solid ${styles.containerBorder}`,
        boxShadow: styles.containerShadow,
        padding: toSizeValue(styles.containerPadding),
        gap: toSizeValue(styles.gap),
      }}
    >
      {options.map((option) => {
        const isSelected = normalizedSelected.some((value) => valuesEqual(value, option.value))
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => handleToggle(option.value)}
            className="relative flex-1 cursor-pointer rounded-lg"
            style={{
              border: isSelected ? `1px solid ${styles.selectedBorder}` : 'none',
              boxShadow: isSelected ? styles.selectedShadow : 'none',
              background: isSelected ? styles.selectedBg : 'transparent',
              padding: styles.buttonPadding,
              color: isSelected ? styles.selectedTextColor : styles.textColor,
              fontWeight: 600,
              fontSize: toSizeValue(styles.textSize),
              zIndex: 1,
            }}
          >
            <span className="relative z-10">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
