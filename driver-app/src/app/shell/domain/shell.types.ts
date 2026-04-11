import type { Coordinates } from '@/shared/map'
import type { MapNavigationDestination } from '@/app/services/mapNavigation.service'
import type { PhoneCallOption } from '@/app/services/phoneCall.service'
import { DRIVER_SHELL_CONFIG } from './shell.config'

export type ShellSurface = 'bottom-sheet' | 'side-menu' | 'sliding-page' | 'overlay'
export type BottomSheetSnap = 'collapsed' | 'workspace' | 'expanded'
export type ShellSurfaceFocus = 'bottom-sheet' | 'side-menu' | 'sliding-page' | 'overlay'
export type BottomSheetMotionState = 'idle' | 'dragging' | 'snapping'

export type BottomSheetPageId =
  | 'route-workspace'
  | 'route-stop-detail'

export type SideMenuPageId = 'menu-home'

export type SlidingPagePageId =
  | 'test-sliding-page'
  | 'notifications'
  | 'route-stop-order-items'
  | 'route-stop-customer'
  | 'route-stop-failure-form'
  | 'map-app-chooser'
  | 'phone-call-chooser'
  | 'route-three-dot-menu'
  | 'route-stop-order-notes'

export type OverlayPageId =
  | 'shell-overlay-placeholder'
  | 'order-case-main'
  | 'route-date-adjust-warning'

export type BottomSheetPageParamsMap = {
  'route-workspace': undefined
  'route-stop-detail': { stopClientId: string }
}

export type SideMenuPageParamsMap = {
  'menu-home': undefined
}

export type SlidingPagePageParamsMap = {
  'test-sliding-page': { title: string }
  notifications: undefined
  'route-stop-order-items': { stopClientId: string }
  'route-stop-customer': { stopClientId: string }
  'route-stop-failure-form': { stopClientId: string; orderId: number }
  'map-app-chooser': { destination: MapNavigationDestination }
  'phone-call-chooser': { options: PhoneCallOption[] }
  'route-three-dot-menu': undefined
  'route-stop-order-notes': { notes: string[] }
}

export type OverlayPageParamsMap = {
  'shell-overlay-placeholder': { title: string; message: string }
  'order-case-main': {
    orderId: number
    orderClientId?: string
    stopClientId?: string
    orderCaseId?: number
    orderCaseClientId?: string
    freshAfter?: string | null
  }
  'route-date-adjust-warning': {
    title: string
    message: string
    confirmLabel: string
    onConfirm: () => Promise<boolean>
  }
}

type StackEntryBase<PageId extends string, Params> = {
  key: string
  page: PageId
  params: Params
}

export type BottomSheetStackEntry = {
  [PageId in BottomSheetPageId]: StackEntryBase<PageId, BottomSheetPageParamsMap[PageId]>
}[BottomSheetPageId]

export type SideMenuStackEntry = {
  [PageId in SideMenuPageId]: StackEntryBase<PageId, SideMenuPageParamsMap[PageId]>
}[SideMenuPageId]

export type SlidingPageStackEntry = {
  [PageId in SlidingPagePageId]: StackEntryBase<PageId, SlidingPagePageParamsMap[PageId]>
}[SlidingPagePageId]

export type OverlayStackEntry = {
  [PageId in OverlayPageId]: StackEntryBase<PageId, OverlayPageParamsMap[PageId]>
}[OverlayPageId]

export type ShellStoreState = {
  bottomSheetStack: BottomSheetStackEntry[]
  sideMenuStack: SideMenuStackEntry[]
  slidingPageStack: SlidingPageStackEntry[]
  overlayStack: OverlayStackEntry[]
  bottomSheetSnap: BottomSheetSnap
  bottomSheetHeightPercent: number
  bottomSheetMotionState: BottomSheetMotionState
  currentLocation: Coordinates | null
  currentLocationFocusRequestKey: number
  currentLocationStatus: 'idle' | 'locating' | 'ready' | 'error'
  currentLocationError: string | null
  surfaceFocus: ShellSurfaceFocus
}

export type ShellStore = ReturnType<typeof import('../stores/shell.store').createShellStore>

export const BOTTOM_SHEET_HEIGHTS: Record<BottomSheetSnap, number> = {
  collapsed: DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.collapsed,
  workspace: DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.workspace,
  expanded: DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.expanded,
}

export function createStackKey(page: string) {
  return `${page}:${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}:${Math.random().toString(16).slice(2)}`}`
}
