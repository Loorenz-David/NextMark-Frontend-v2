import { createContext, useContext } from 'react'
import type {
  BottomSheetPageId,
  BottomSheetPageParamsMap,
  BottomSheetMotionState,
  BottomSheetSnap,
  OverlayPageId,
  OverlayPageParamsMap,
  ShellStore,
  SlidingPagePageId,
  SlidingPagePageParamsMap,
  SideMenuPageId,
  SideMenuPageParamsMap,
} from '../domain/shell.types'

export type DriverAppShellContextValue = {
  store: ShellStore
  openBottomSheet: <PageId extends BottomSheetPageId>(
    page: PageId,
    params: BottomSheetPageParamsMap[PageId],
  ) => void
  pushBottomSheet: <PageId extends BottomSheetPageId>(
    page: PageId,
    params: BottomSheetPageParamsMap[PageId],
  ) => void
  replaceCurrentBottomSheet: <PageId extends BottomSheetPageId>(
    page: PageId,
    params: BottomSheetPageParamsMap[PageId],
  ) => void
  openSideMenu: <PageId extends SideMenuPageId>(
    page: PageId,
    params: SideMenuPageParamsMap[PageId],
  ) => void
  closeSideMenu: () => void
  openSlidingPage: <PageId extends SlidingPagePageId>(
    page: PageId,
    params: SlidingPagePageParamsMap[PageId],
  ) => void
  closeSlidingPage: () => void
  openOverlay: <PageId extends OverlayPageId>(
    page: PageId,
    params: OverlayPageParamsMap[PageId],
  ) => void
  pushOverlay: <PageId extends OverlayPageId>(
    page: PageId,
    params: OverlayPageParamsMap[PageId],
  ) => void
  popOverlay: () => void
  closeOverlay: () => void
  snapBottomSheetTo: (snap: BottomSheetSnap) => void
  setBottomSheetSnap: (snap: BottomSheetSnap) => void
  setBottomSheetHeight: (percent: number) => void
  setBottomSheetMotionState: (motionState: BottomSheetMotionState) => void
  handleSurfaceBack: () => boolean
}

export const DriverAppShellContext = createContext<DriverAppShellContextValue | null>(null)

export function useDriverAppShell() {
  const context = useContext(DriverAppShellContext)
  if (!context) {
    throw new Error('useDriverAppShell must be used within DriverAppShellProvider')
  }

  return context
}
