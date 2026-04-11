import { useMemo, useSyncExternalStore } from 'react'
import { useDriverServices } from '@/app/providers/driverServices.context'
import { useConnectivity } from '@/app/providers/connectivity.context'
import { useSession } from '@/app/providers/session.context'
import { useWorkspace } from '@/app/providers/workspace.context'
import { useRouteExecutionShell } from '@/features/route-execution/providers/routeExecutionShell.context'
import { locateCurrentLocationAction } from '../actions/locateCurrentLocation.action'
import { DRIVER_SHELL_CONFIG } from '../domain/shell.config'
import { useDriverAppShell } from '../providers/driverAppShell.context'
import {
  selectMapSurfaceState,
  selectSurfaceFocus,
  selectBottomSheetState,
  selectOverlayState,
  selectSideMenuState,
  selectSlidingPageState,
} from '../stores/shell.selectors'

export function useDriverAppShellChromeController() {
  const { browserLocationService } = useDriverServices()
  const { isOnline } = useConnectivity()
  const { clearSession } = useSession()
  const { workspace } = useWorkspace()
  const { closeRouteSearch, routeViewMode } = useRouteExecutionShell()
  const {
    store,
    openSideMenu,
    closeSideMenu,
    openOverlay,
    closeOverlay,
    handleSurfaceBack,
  } = useDriverAppShell()

  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )

  const bottomSheetState = useMemo(() => selectBottomSheetState(shellState), [shellState])
  const sideMenuState = useMemo(() => selectSideMenuState(shellState), [shellState])
  const slidingPageState = useMemo(() => selectSlidingPageState(shellState), [shellState])
  const overlayState = useMemo(() => selectOverlayState(shellState), [shellState])
  const mapSurfaceState = useMemo(() => selectMapSurfaceState(shellState), [shellState])
  const surfaceFocus = useMemo(() => selectSurfaceFocus(shellState), [shellState])
  const headerFadeProgress = useMemo(() => {
    const fadeStartPercent = DRIVER_SHELL_CONFIG.bottomSheet.snapHeights.workspace
    const fadeEndPercent = DRIVER_SHELL_CONFIG.bottomSheet.headerFadeEndPercent
    const currentPercent = bottomSheetState.heightPercent

    if (currentPercent <= fadeStartPercent) {
      return 1
    }

    if (currentPercent >= fadeEndPercent) {
      return 0
    }

    const progress = 1 - ((currentPercent - fadeStartPercent) / (fadeEndPercent - fadeStartPercent))
    return Math.max(0, Math.min(1, progress))
  }, [bottomSheetState.heightPercent])
  const headerOpacity = headerFadeProgress
  const headerTranslateYPx = useMemo(() => {
    const maxTranslatePx = 28
    return (1 - headerFadeProgress) * maxTranslatePx
  }, [headerFadeProgress])
  const shouldRenderOverSheetChrome = headerOpacity > 0
  const isOverSheetChromeInteractive = headerOpacity > 0
  const shouldRenderHeader = shouldRenderOverSheetChrome
  const showHeader = shouldRenderHeader

  return useMemo(() => ({
    workspace,
    isOnline,
    surfaceFocus,
    canGoBack:
      overlayState.isOpen
      || slidingPageState.isOpen
      || sideMenuState.isOpen
      || bottomSheetState.canPop
      || bottomSheetState.snap !== 'workspace',
    isSideMenuOpen: sideMenuState.isOpen,
    openMenu: () => openSideMenu('menu-home', undefined),
    closeMenu: closeSideMenu,
    openShellHelp: () => openOverlay('shell-overlay-placeholder', {
      title: 'Driver Shell',
      message: 'OverlaySurface is live and blocks lower-surface interaction. Route execution remains the first bottom-sheet workspace.',
    }),
    shouldRenderOverSheetChrome,
    isOverSheetChromeInteractive,
    overSheetChromeOpacity: headerOpacity,
    overSheetChromeTranslateYPx: headerTranslateYPx,
    showHeaderMenuButton: bottomSheetState.snap !== 'expanded',
    shouldRenderHeader,
    showHeader,
    headerOpacity,
    headerTranslateYPx,
    locateCurrentLocation: async () => locateCurrentLocationAction({
      browserLocationService,
      store,
    }),
    isLocatingCurrentLocation: mapSurfaceState.currentLocationStatus === 'locating',
    closeShellHelp: closeOverlay,
    handleBack: () => {
      if (routeViewMode === 'search') {
        closeRouteSearch()
        return true
      }

      return handleSurfaceBack()
    },
    clearSession,
  }), [
    browserLocationService,
    bottomSheetState.canPop,
    bottomSheetState.snap,
    clearSession,
    closeOverlay,
    closeRouteSearch,
    closeSideMenu,
    headerOpacity,
    headerTranslateYPx,
    handleSurfaceBack,
    isOnline,
    mapSurfaceState.currentLocationStatus,
    openOverlay,
    openSideMenu,
    overlayState.isOpen,
    routeViewMode,
    shouldRenderOverSheetChrome,
    sideMenuState.isOpen,
    slidingPageState.isOpen,
    store,
    surfaceFocus,
    isOverSheetChromeInteractive,
    shouldRenderHeader,
    showHeader,
    workspace,
  ])
}
