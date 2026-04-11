import type { ChangeEvent, CSSProperties, ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { FilteredIcon } from '@/assets/icons'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'

export type SearchBarFilterOption = {
  label: string
  value: unknown
}

export type SearchBarValue = {
  input: string | null
  filters: unknown[]
}

type SearchBarProps = {
  options?: SearchBarFilterOption[]
  onChange: (value: SearchBarValue) => void
  className?: string
  style?: CSSProperties
  placeholder?:string
  inputClassName?: string
  inputStyle?: CSSProperties
  iconClassName?: string
  iconStyle?: CSSProperties
  onFilterTrigger?: () => void
  children?: ReactNode
}

export const SearchBar = ({
  options = [],
  onChange,
  className,
  style,
  placeholder,
  inputClassName,
  inputStyle,
  iconClassName,
  iconStyle,
  onFilterTrigger,
  children,
}: SearchBarProps) => {
  const [input, setInput] = useState<string | null>('')
  const [filters, setFilters] = useState<unknown[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const selectedSet = useMemo(() => new Set(filters), [filters])

  const emitChange = (nextInput: string | null, nextFilters: unknown[]) => {
    onChange({ input: nextInput, filters: nextFilters })
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInput(value)
    emitChange(value, filters)
  }

  const toggleFilter = (value: unknown) => {
    const isSelected = selectedSet.has(value)
    const nextFilters = isSelected
      ? filters.filter((item) => item !== value)
      : [...filters, value]
    setFilters(nextFilters)
    emitChange(input, nextFilters)
  }

  const handleFilterClick = () => {
    if (onFilterTrigger) {
      onFilterTrigger()
      return
    }
    setIsOpen((prev) => !prev)
  }

  return (
    <div className={className} style={style}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input ?? ''}
          onChange={handleInputChange}
          className={inputClassName ?? 'w-full'}
          style={inputStyle}
          placeholder={placeholder ?? ''}
        />
        <FloatingPopover
          open={isOpen}
          onOpenChange={setIsOpen}
          reference={
            <button
              type="button"
              onClick={handleFilterClick}
              className={iconClassName ?? 'p-1 '}
              style={iconStyle}
            >
              <FilteredIcon className="h-4 w-4" />
            </button>
          }
        >
          {children ?? (
            <div className="admin-glass-popover flex flex-col gap-2 rounded-xl border border-[var(--color-border-accent)] p-2 shadow-md">
              {options.map((option) => {
                const isSelected = selectedSet.has(option.value)
                return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => toggleFilter(option.value)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-white/[0.08]"
                >
                  <span className={` ${isSelected ? "text-[rgb(var(--color-light-blue-r))]": "text-[var(--color-text)]"}`}>{option.label}</span>
                  
                </button>
              )})}
              {!options.length && (
                <span className="text-xs text-[var(--color-muted)]">No filters available.</span>
              )}
            </div>
          )}
        </FloatingPopover>
      </div>
    </div>
  )
}
