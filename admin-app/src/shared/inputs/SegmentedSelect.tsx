import { useId } from 'react'
import { motion } from 'framer-motion'

type SegmentedOption = {
  label: string
  value: string | number
}

type SegmentedSelectStyleConfig = {
  containerPadding?: string | number
  containerBg?: string
  containerBorder?: string
  containerShadow?: string
  selectedBg?: string
  selectedBorder?: string
  selectedShadow?: string
  textColor?: string
  buttonPadding?:string
  selectedTextColor?: string
  textSize?: string | number
}

type SegmentedSelectProps = {
  options: SegmentedOption[]
  selectedValue: string | number
  onSelect: (value: string | number) => void
  styleConfig?: SegmentedSelectStyleConfig
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
  buttonPadding:'8px 12px',
  textSize: '15px',
}


const toSizeValue = (value: string | number) =>
  typeof value === 'number' ? `${value}px` : value

const SegmentedSelect = ({
  options,
  selectedValue,
  onSelect,
  styleConfig,
}: SegmentedSelectProps) => {
  const layoutId = useId()
  const styles = {
    ...DEFAULT_STYLE,
    ...(styleConfig ?? {}),
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
      }}
    >
      {options.map((option) => {
        const isSelected = option.value === selectedValue
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onSelect(option.value)}
            className="relative flex-1 cursor-pointer rounded-lg"
            style={{
              border: 'none',
              background: 'transparent',
              padding: styles.buttonPadding,
              color: isSelected ? styles.selectedTextColor : styles.textColor,
              fontWeight: 600,
              fontSize: toSizeValue(styles.textSize),
              zIndex: 1,
            }}
          >
            {isSelected && (
              <motion.div
                layoutId={`segmented-select-highlight-${layoutId}`}
                layoutDependency={selectedValue}
                className="absolute inset-0 rounded-lg"
                style={{
                  background: styles.selectedBg,
                  border: `1px solid ${styles.selectedBorder}`,
                  boxShadow: styles.selectedShadow,
                  zIndex: 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedSelect
