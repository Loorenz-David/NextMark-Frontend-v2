import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useDriverAppShell } from '@/app/shell/providers/driverAppShell.context'
import { useRouteExecutionShell } from '../providers/routeExecutionShell.context'
import { selectBottomSheetState, selectSideMenuState } from '@/app/shell/stores/shell.selectors'

export function useAssignedRouteToolbarController() {
  const { store, closeSideMenu, openSideMenu, openSlidingPage, snapBottomSheetTo } = useDriverAppShell()
  const { closeRouteSearch, openRouteSearch, routeSearchQuery, routeViewMode, setRouteSearchQuery } = useRouteExecutionShell()

  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )

  const bottomSheetState = useMemo(() => selectBottomSheetState(shellState), [shellState])
  const sideMenuState = useMemo(() => selectSideMenuState(shellState), [shellState])

  const enterRouteSearch = useCallback(() => {
    openRouteSearch()
    snapBottomSheetTo('expanded')
  }, [openRouteSearch, snapBottomSheetTo])

  const openSideMenuFromToolbar = useCallback(() => {
    if (sideMenuState.isOpen) {
      closeSideMenu()
      return
    }

    openSideMenu('menu-home', undefined)
  }, [closeSideMenu, openSideMenu, sideMenuState.isOpen])

  const openThreeDotMenu = useCallback(() => {
    openSlidingPage('route-three-dot-menu', undefined)
  }, [openSlidingPage])

  return useMemo(() => ({
    routeViewMode,
    searchValue: routeSearchQuery,
    showEmbeddedMenuButton:
      bottomSheetState.snap === 'expanded'
      && bottomSheetState.currentPage?.page === 'route-workspace'
      && routeViewMode === 'route',
    showShellHeaderMenuButton: bottomSheetState.snap !== 'expanded',
    isSideMenuOpen: sideMenuState.isOpen,
    onBackFromSearch: closeRouteSearch,
    onSearchValueChange: routeViewMode === 'search' ? setRouteSearchQuery : enterRouteSearch,
    onSearchFocus: routeViewMode === 'search' ? undefined : enterRouteSearch,
    onOpenSideMenu: openSideMenuFromToolbar,
    onOpenThreeDotMenu: openThreeDotMenu,
  }), [
    bottomSheetState.currentPage?.page,
    bottomSheetState.snap,
    closeRouteSearch,
    enterRouteSearch,
    openSideMenuFromToolbar,
    openThreeDotMenu,
    routeSearchQuery,
    routeViewMode,
    setRouteSearchQuery,
    sideMenuState.isOpen,
  ])
}
