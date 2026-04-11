import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'

import { ObjectLinkSelectorInput } from './ObjectLinkSelectorInput'
import { ObjectLinkSelectorOptionCard } from './ObjectLinkSelectorOptionCard'
import { ObjectLinkSelectorSelectedOverlay } from './ObjectLinkSelectorSelectedOverlay'
import type { ObjectLinkSelectorProps } from './ObjectLinkSelector.types'
import { useObjectLinkSelector } from './useObjectLinkSelector'

export const ObjectLinkSelector = ({
  mode = 'single',
  options,
  selectedItems,
  onSelectItem,
  onRemoveSelectedItem,
  onQueryChange,
  queryValue,
  defaultQueryValue,
  placeholder = 'Search and select',
  emptyOptionsMessage = 'No matching values found.',
  emptySelectedMessage = 'No selected values.',
  selectedOverlayTitle = 'Selected values',
  selectedButtonLabel = 'Selected',
  loading = false,
  disabled = false,
  containerClassName,
}: ObjectLinkSelectorProps) => {
  const selectedIds = new Set(selectedItems.map((item) => item.id))

  const {
    displayValue,
    isOptionsOpen,
    isSelectedOverlayOpen,
    setIsOptionsOpen,
    handleInputChange,
    handleInputFocus,
    handleSelectItem,
    handleToggleOptions,
    handleOpenSelectedOverlay,
    handleCloseSelectedOverlay,
  } = useObjectLinkSelector({
    mode,
    selectedItems,
    onSelectItem,
    onRemoveSelectedItem,
    onQueryChange,
    queryValue,
    defaultQueryValue,
  })

  return (
    <>
      <FloatingPopover
        open={isOptionsOpen}
        onOpenChange={setIsOptionsOpen}
        classes="relative w-full"
        matchReferenceWidth
        floatingClassName="z-[180]"
        renderInPortal
        reference={
          <ObjectLinkSelectorInput
            mode={mode}
            open={isOptionsOpen}
            disabled={disabled}
            placeholder={placeholder}
            displayValue={displayValue}
            selectedCount={selectedItems.length}
            selectedButtonLabel={selectedButtonLabel}
            containerClassName={containerClassName}
            onInputChange={handleInputChange}
            onInputFocus={handleInputFocus}
            onToggleOptions={handleToggleOptions}
            onOpenSelectedOverlay={handleOpenSelectedOverlay}
          />
        }
      >
        <div className="admin-glass-popover flex max-h-[320px] flex-col gap-2 overflow-y-auto rounded-2xl border border-[var(--color-border-accent)] p-2 shadow-xl scroll-thin">
          {loading ? (
            <p className="px-3 py-2 text-sm text-[var(--color-muted)]">Loading...</p>
          ) : options.length ? (
            options.map((item) => {
              const isSelected = selectedIds.has(item.id)

              return (
                <ObjectLinkSelectorOptionCard
                  key={item.id}
                  item={item}
                  selected={isSelected}
                  onSelect={isSelected && onRemoveSelectedItem ? onRemoveSelectedItem : handleSelectItem}
                />
              )
            })
          ) : (
            <p className="px-3 py-2 text-sm text-[var(--color-muted)]">{emptyOptionsMessage}</p>
          )}
        </div>
      </FloatingPopover>

      <ObjectLinkSelectorSelectedOverlay
        open={isSelectedOverlayOpen}
        title={selectedOverlayTitle}
        items={selectedItems}
        emptyMessage={emptySelectedMessage}
        onClose={handleCloseSelectedOverlay}
        onRemoveItem={onRemoveSelectedItem}
      />
    </>
  )
}
