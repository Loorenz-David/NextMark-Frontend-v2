import { useCallback, useMemo, useState } from 'react'

import type { ObjectLinkSelectorItem, ObjectLinkSelectorMode } from './ObjectLinkSelector.types'

type UseObjectLinkSelectorProps = {
  mode: ObjectLinkSelectorMode
  selectedItems: ObjectLinkSelectorItem[]
  onSelectItem: (item: ObjectLinkSelectorItem) => void
  onRemoveSelectedItem?: (item: ObjectLinkSelectorItem) => void
  onQueryChange?: (value: string) => void
  queryValue?: string
  defaultQueryValue?: string
}

export const useObjectLinkSelector = ({
  mode,
  selectedItems,
  onSelectItem,
  onRemoveSelectedItem,
  onQueryChange,
  queryValue,
  defaultQueryValue = '',
}: UseObjectLinkSelectorProps) => {
  const [internalQuery, setInternalQuery] = useState(defaultQueryValue)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isSelectedOverlayOpen, setIsSelectedOverlayOpen] = useState(false)

  const query = queryValue ?? internalQuery

  const setQuery = useCallback(
    (value: string) => {
      if (queryValue === undefined) {
        setInternalQuery(value)
      }
      onQueryChange?.(value)
    },
    [onQueryChange, queryValue],
  )

  const displayValue = useMemo(() => {
    if (query.length > 0) {
      return query
    }

    if (mode === 'single') {
      return selectedItems[0]?.label ?? ''
    }

    return ''
  }, [mode, query, selectedItems])

  const handleInputChange = useCallback(
    (value: string) => {
      if (mode === 'single' && query.length === 0 && selectedItems[0] && onRemoveSelectedItem) {
        onRemoveSelectedItem(selectedItems[0])
      }

      setQuery(value)
      setIsOptionsOpen(true)
    },
    [mode, onRemoveSelectedItem, query.length, selectedItems, setQuery],
  )

  const handleSelectItem = useCallback(
    (item: ObjectLinkSelectorItem) => {
      onSelectItem(item)
      setQuery('')

      if (mode === 'single') {
        setIsOptionsOpen(false)
        return
      }

      setIsOptionsOpen(true)
    },
    [mode, onSelectItem, setQuery],
  )

  const handleToggleOptions = useCallback(() => {
    setIsOptionsOpen((current) => !current)
  }, [])

  const handleInputFocus = useCallback(() => {
    setIsOptionsOpen(true)
  }, [])

  const handleOpenSelectedOverlay = useCallback(() => {
    setIsOptionsOpen(false)
    setIsSelectedOverlayOpen(true)
  }, [])

  const handleCloseSelectedOverlay = useCallback(() => {
    setIsSelectedOverlayOpen(false)
  }, [])

  return {
    query,
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
  }
}
