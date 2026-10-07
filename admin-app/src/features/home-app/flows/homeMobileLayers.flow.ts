import { useMemo } from 'react'

import { useOpenBottomSheetCount } from '@/shared/overlays/bottomSheet'
import {
  useBaseControlls,
  usePopupManager,
  useSectionManager,
} from '@/shared/resource-manager/useResourceManager'
import { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'

import type { HomeMobileLayerCounts } from '../domain/homeMobileShell.types'
import { useHomeMobileShellStore } from '../stores/homeMobileShell.store'

const countOpen = (entries: readonly { isClosing: boolean }[]) =>
  entries.filter((entry) => !entry.isClosing).length

/**
 * Live picture of what is stacked above the active tab root. Read from the
 * global managers so it is correct no matter which workspace is active.
 */
export const useHomeMobileLayersFlow = (): HomeMobileLayerCounts => {
  const popupManager = usePopupManager()
  const sectionManager = useSectionManager()
  const baseControlls = useBaseControlls()
  const popupEntries = useStackActionEntries(popupManager)
  const sectionEntries = useStackActionEntries(sectionManager)
  const sheets = useOpenBottomSheetCount()
  const isMenuOpen = useHomeMobileShellStore((state) => state.isMenuOpen)

  const popups = countOpen(popupEntries)
  const sections = countOpen(sectionEntries)
  const base = baseControlls.isBaseOpen

  return useMemo(
    () => ({ popups, sheets, menu: isMenuOpen, sections, base }),
    [base, isMenuOpen, popups, sections, sheets],
  )
}
